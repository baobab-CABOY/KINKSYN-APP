// Node/partner-tagged reflection journal.
export const journalMethods = {
  // =========================================================================
  // NODE- & PARTNER-TAGGED SOMATIC EXPERIENCE JOURNAL
  // =========================================================================
  addJournalEntry(nodeId) {
    const textEl = document.getElementById('journalNoteInput');
    const stateEl = document.getElementById('journalStateSelect');
    const partnerEl = document.getElementById('journalPartnerSelect');
    if (!textEl || !textEl.value.trim()) {
      this.showToast('Write a brief reflection note first');
      return;
    }

    const entry = {
      id: `jr_${Date.now()}`,
      nodeId,
      note: textEl.value.trim(),
      somaticState: stateEl ? stateEl.value : 'Grounded & Connected',
      partnerTag: partnerEl && partnerEl.value ? partnerEl.value : 'Solo Reflection',
      timestamp: Date.now()
    };

    this.journalEntries.unshift(entry);
    this.persistVault();
    this.renderInsightPanel();
    this.showToast('Logged reflection to node journal');
  },

  deleteJournalEntry(entryId) {
    this.journalEntries = this.journalEntries.filter(e => e.id !== entryId);
    this.persistVault();
    this.renderInsightPanel();
    this.showToast('Journal entry removed');
  },
};
