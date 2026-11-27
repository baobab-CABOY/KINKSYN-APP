// Local vault (localStorage, optional encryption) + snapshots + vault modal.
import { VAULT_STORAGE_KEY } from '../config.js';
import { vaultCrypto } from '../core/crypto.js';
import { DRIVERS } from '../data/nodes.js';
import { escapeHtml } from '../core/utils.js';

export const vaultMethods = {
  checkLocalVaultOnBoot() {
    try {
      const raw = localStorage.getItem(VAULT_STORAGE_KEY);
      if (!raw) {
        this.vaultStatus = 'empty';
        return;
      }
      const parsed = JSON.parse(raw);
      if (parsed.encrypted) {
        this.vaultStatus = 'locked';
      } else if (parsed.data) {
        this.hydrateVaultData(parsed.data);
        this.vaultStatus = 'unlocked';
      }
    } catch (e) {
      this.vaultStatus = 'empty';
    }
  },

  hydrateVaultData(data) {
    if (data.profile) this.profile = data.profile;
    if (Array.isArray(data.snapshots)) this.snapshots = data.snapshots;
    if (Array.isArray(data.journalEntries)) this.journalEntries = data.journalEntries;
    if (Array.isArray(data.savedPartners)) this.savedPartners = data.savedPartners;
    if (this.profile) {
      const sortedDrivers = Object.keys(DRIVERS).sort((a, b) => (this.profile.nodes[b]?.score || 0) - (this.profile.nodes[a]?.score || 0));
      this.selectedNodeId = sortedDrivers[0] || 'surrender';
    }
  },

  async persistVault(customPassphrase = undefined) {
    if (!this.profile) return;
    const passToUse = customPassphrase !== undefined ? customPassphrase : this.vaultPassphrase;
    const payload = {
      profile: this.profile,
      snapshots: this.snapshots,
      journalEntries: this.journalEntries,
      savedPartners: this.savedPartners,
      updatedAt: Date.now()
    };

    try {
      if (passToUse && passToUse.trim().length > 0 && window.crypto?.subtle) {
        const envelope = await vaultCrypto.encryptPayload(payload, passToUse.trim());
        localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(envelope));
        this.vaultPassphrase = passToUse.trim();
        this.vaultStatus = 'unlocked';
      } else {
        localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify({ encrypted: false, data: payload }));
        this.vaultPassphrase = null;
        this.vaultStatus = 'unlocked';
      }
      this.renderHeader();
    } catch (err) {
      console.error('Vault save error:', err);
      this.showToast('Could not save to local device storage');
    }
  },

  async unlockVaultWithPassphrase(passphrase) {
    try {
      const raw = localStorage.getItem(VAULT_STORAGE_KEY);
      if (!raw) return false;
      const envelope = JSON.parse(raw);
      const data = await vaultCrypto.decryptPayload(envelope, passphrase.trim());
      this.hydrateVaultData(data);
      this.vaultPassphrase = passphrase.trim();
      this.vaultStatus = 'unlocked';
      this.closeModal('vaultModal');
      this.view = 'graph';
      this.render();
      this.showToast('Encrypted local vault unlocked');
      return true;
    } catch (e) {
      this.showToast('Incorrect passphrase — decryption failed');
      return false;
    }
  },

  wipeLocalVault() {
    localStorage.removeItem(VAULT_STORAGE_KEY);
    this.vaultPassphrase = null;
    this.vaultStatus = 'empty';
    this.snapshots = [];
    this.journalEntries = [];
    this.savedPartners = [];
    this.closeModal('vaultModal');
    this.renderHeader();
    this.showToast('Local device vault wiped');
  },

  captureSnapshot() {
    if (!this.profile) return;
    const labelInput = document.getElementById('snapshotLabelInput');
    const label = labelInput && labelInput.value.trim()
      ? labelInput.value.trim()
      : `Map Checkpoint #${this.snapshots.length + 1}`;
    const snap = {
      id: `snap_${Date.now()}`,
      label,
      timestamp: Date.now(),
      archetype: this.getArchetypeTitle(this.profile),
      nodes: JSON.parse(JSON.stringify(this.profile.nodes))
    };
    this.snapshots.unshift(snap);
    if (this.snapshots.length > 15) this.snapshots.pop();
    this.persistVault();
    this.renderVaultModal();
    this.showToast(`Saved snapshot: ${label}`);
  },

  restoreSnapshot(snapId) {
    const snap = this.snapshots.find(s => s.id === snapId);
    if (!snap || !this.profile) return;
    this.profile.nodes = JSON.parse(JSON.stringify(snap.nodes));
    this.profile.timestamp = Date.now();
    this.persistVault();
    if (this.graphEngine) {
      this.initGraphCanvas();
    }
    this.renderInsightPanel();
    this.closeModal('vaultModal');
    this.showToast(`Restored map from "${snap.label}"`);
  },

  openVaultModal() {
    const m = document.getElementById('vaultModal');
    if (m) {
      this.renderVaultModal();
      m.classList.remove('hidden');
      m.classList.add('flex');
    }
  },

  renderVaultModal() {
    const body = document.getElementById('vaultModalBody');
    if (!body) return;

    if (this.vaultStatus === 'locked') {
      body.innerHTML = `
        <div class="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-3">
          <div class="font-mono text-xs text-amber-300 uppercase">Vault Locked (AES-256-GCM Encrypted)</div>
          <p class="text-xs text-zinc-300 leading-relaxed">
            An encrypted SYNAPSE profile, experience journal, and snapshot history is stored locally on this device. Enter your passphrase to decrypt it in memory.
          </p>
          <div class="flex flex-col sm:flex-row gap-2">
            <input id="unlockVaultInput" type="password" placeholder="Enter vault passphrase..." class="flex-1 bg-black/70 border border-white/15 rounded-xl px-3.5 py-2.5 font-mono text-xs text-white focus:outline-none focus:border-teal-400" />
            <button type="button" onclick="app.unlockVaultWithPassphrase(document.getElementById('unlockVaultInput').value)" class="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-mono font-semibold transition">
              Unlock Vault
            </button>
          </div>
          <div class="pt-2 border-t border-white/[0.06] flex justify-between items-center">
            <span class="text-[11px] text-zinc-500">Forgot passphrase? Zero-knowledge means we cannot recover it.</span>
            <button type="button" onclick="app.wipeLocalVault()" class="text-[11px] font-mono text-rose-400 hover:underline">Reset Vault</button>
          </div>
        </div>
      `;
      return;
    }

    body.innerHTML = `
      <!-- Save / Encrypt Current Living Map -->
      <div class="p-3.5 rounded-xl bg-teal-500/[0.06] border border-teal-500/25 space-y-2.5">
        <div class="flex items-center justify-between">
          <span class="font-mono text-[11px] uppercase tracking-wider text-teal-300">01 // Device Vault Persistence</span>
          <span class="font-mono text-[10px] px-2 py-0.5 rounded bg-black/50 text-teal-200">
            ${this.vaultPassphrase ? 'AES-GCM Encrypted' : this.vaultStatus === 'unlocked' ? 'Saved Locally (Unencrypted)' : 'Not Yet Saved'}
          </span>
        </div>
        <p class="text-xs text-zinc-300 leading-relaxed">
          Save your living map, live node adjustments, partner roster, and somatic journal locally on this phone/browser. Leave passphrase blank for instant local save, or enter a passphrase for AES-256 encryption.
        </p>
        <div class="flex flex-col sm:flex-row gap-2">
          <input id="setVaultPassInput" type="password" value="${this.vaultPassphrase || ''}" placeholder="Optional AES-256 Passphrase..." class="flex-1 bg-black/65 border border-white/10 rounded-xl px-3 py-2 font-mono text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-teal-400" />
          <button type="button" onclick="app.persistVault(document.getElementById('setVaultPassInput').value).then(() => { app.renderVaultModal(); app.showToast('Saved living profile to local vault'); })" class="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-mono font-semibold transition shrink-0">
            Save to Vault
          </button>
        </div>
      </div>

      <!-- Time-Lapse Evolution Snapshots -->
      <div class="p-3.5 rounded-xl bg-black/45 border border-white/[0.08] space-y-3">
        <div class="flex items-center justify-between">
          <span class="font-mono text-[11px] uppercase tracking-wider text-purple-300">02 // Time-Lapse Evolution Snapshots (${this.snapshots.length})</span>
          <span class="font-mono text-[10px] text-zinc-500">Track Desire Shifts</span>
        </div>
        <div class="flex flex-col sm:flex-row gap-2">
          <input id="snapshotLabelInput" type="text" maxlength="32" placeholder="Checkpoint label (e.g., Autumn Exploration)" class="flex-1 bg-black/65 border border-white/10 rounded-xl px-3 py-2 font-mono text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none" />
          <button type="button" onclick="app.captureSnapshot()" class="px-3.5 py-2 rounded-xl bg-purple-600/80 hover:bg-purple-500 text-white text-xs font-mono font-medium transition shrink-0">
            + Capture Snapshot
          </button>
        </div>

        <div class="space-y-2 max-h-56 overflow-y-auto pr-1">
          ${this.snapshots.length === 0 ? `
            <div class="text-xs text-zinc-500 py-3 text-center font-mono">No snapshots captured yet. Capture one before or after refining nodes.</div>
          ` : this.snapshots.map(s => {
            const dateStr = new Date(s.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            return `
              <div class="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-between gap-3">
                <div class="min-w-0">
                  <div class="text-xs font-semibold text-zinc-100 truncate">${escapeHtml(s.label)}</div>
                  <div class="font-mono text-[10px] text-zinc-400 truncate">${dateStr} · ${s.archetype}</div>
                </div>
                <button type="button" onclick="app.restoreSnapshot('${s.id}')" class="px-2.5 py-1.5 rounded-lg bg-white/[0.07] hover:bg-white/[0.14] text-[10px] font-mono text-purple-200 shrink-0 transition">
                  Restore
                </button>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Wipe Option -->
      <div class="flex items-center justify-between pt-1 text-[11px] font-mono text-zinc-500">
        <span>Journal Entries Stored: ${this.journalEntries.length} · Saved Partners: ${this.savedPartners.length}</span>
        <button type="button" onclick="app.wipeLocalVault()" class="text-rose-400 hover:underline">Wipe Local Data</button>
      </div>
    `;
  },
};
