// Scoring (answers -> profile), live node edits, archetype title, share encode/decode.
import { DRIVERS, ALL_NODES_MAP } from '../data/nodes.js';
import { RESONANCE_OPTIONS } from '../data/questions.js';
import { ACTIVITIES } from '../data/nodes.js';

export const profileMethods = {
  computeProfile() {
    const totals = {};
    const recTotals = {};
    const giveTotals = {};
    const maxPossible = {};
    const fantasyPoints = {};
    const realityPoints = {};
    const polarityCounts = {};
    const limitCounts = {};
    // Nodes explicitly marked Hard Limit on their own (weight 1.0) question. Overrides points from other questions.
    const primaryLimits = new Set();
    const neutralCounts = {};

    const allIds = [...Object.keys(DRIVERS), ...ACTIVITIES.map(a => a.id)];
    allIds.forEach(k => {
      totals[k] = 0;
      recTotals[k] = 0;
      giveTotals[k] = 0;
      maxPossible[k] = 0;
      fantasyPoints[k] = 0;
      realityPoints[k] = 0;
      polarityCounts[k] = [0, 0, 0];
      limitCounts[k] = 0;
      neutralCounts[k] = 0;
    });

    const activeQs = this.getActiveQuestions();
    activeQs.forEach(q => {
      const ans = this.answers[q.id];
      if (!ans) return;
      const resId = ans.resonance;
      const resObj = RESONANCE_OPTIONS.find(r => r.id === resId);
      const rawWeight = resObj ? resObj.weight : 0;
      const activeWeight = rawWeight > 0 ? rawWeight : 0;
      const isFantasy = resObj ? resObj.isFantasy : false;
      const pol = ans.polarity ?? 2;

      Object.entries(q.weights).forEach(([nodeId, factor]) => {
        if (maxPossible[nodeId] !== undefined) {
          maxPossible[nodeId] += factor;
          const earned = activeWeight * factor;
          totals[nodeId] += earned;

          if (resId === 'limit' || rawWeight < 0) limitCounts[nodeId] += factor;
          if (resId === 'limit' && factor >= 1.0) primaryLimits.add(nodeId);
          if (resId === 'neutral') neutralCounts[nodeId] += factor;

          if (earned > 0) {
            if (isFantasy) fantasyPoints[nodeId] += earned;
            else realityPoints[nodeId] += earned;

            if (!q.hasPolarity || pol === 2) {
              recTotals[nodeId] += earned * 0.9;
              giveTotals[nodeId] += earned * 0.9;
            } else if (pol === 0) {
              recTotals[nodeId] += earned;
            } else if (pol === 1) {
              giveTotals[nodeId] += earned;
            }

            polarityCounts[nodeId][pol] += earned;
          }
        }
      });
    });

    const nodes = {
      core: {
        id: 'core',
        score: 100,
        receivingScore: 100,
        givingScore: 100,
        fantasyRatio: 0,
        isPrimarilyFantasy: false,
        polarity: 'Integrated Blueprint',
        statusTag: 'Active Hub'
      }
    };

    allIds.forEach(id => {
      const maxP = maxPossible[id] || 1;
      const rawPct = Math.min(100, Math.round((totals[id] / maxP) * 100));
      const receivingScore = Math.min(100, Math.round((recTotals[id] / maxP) * 100));
      const givingScore = Math.min(100, Math.round((giveTotals[id] / maxP) * 100));

      const totalEarned = fantasyPoints[id] + realityPoints[id];
      const fantasyRatio = totalEarned > 0 ? Math.round((fantasyPoints[id] / totalEarned) * 100) : 0;

      const [rec, give, sw] = polarityCounts[id];
      let polarity = 'Switch / Both';
      if (totalEarned > 0) {
        if (rec > give * 1.3 && rec >= sw) polarity = 'Receive (Sub / Bottom)';
        else if (give > rec * 1.3 && give >= sw) polarity = 'Give (Dom / Top)';
        else polarity = 'Switch / Both';
      }

      let statusTag = 'Unlit';
      if (primaryLimits.has(id)) {
        statusTag = 'Hard Limit';
      } else if (rawPct > 0) {
        statusTag = fantasyRatio >= 55 ? 'Fantasy-Leaning' : 'Embodied Reality';
      } else if (limitCounts[id] > 0 && limitCounts[id] >= neutralCounts[id]) {
        statusTag = 'Hard Limit';
      } else {
        statusTag = 'Neutral / No Charge';
      }

      const limited = statusTag === 'Hard Limit';
      nodes[id] = {
        id,
        score: limited ? 0 : rawPct,
        receivingScore: limited ? 0 : receivingScore,
        givingScore: limited ? 0 : givingScore,
        fantasyRatio,
        isPrimarilyFantasy: !limited && fantasyRatio >= 55 && rawPct > 0,
        polarity,
        statusTag
      };
    });

    const baselineSummary = {
      cognitiveRest: this.answers.q1 ? RESONANCE_OPTIONS.find(r => r.id === this.answers.q1.resonance)?.label : 'Unmapped',
      sensoryFocus: this.answers.q2 ? RESONANCE_OPTIONS.find(r => r.id === this.answers.q2.resonance)?.label : 'Unmapped',
      containmentNeed: this.answers.q3 ? RESONANCE_OPTIONS.find(r => r.id === this.answers.q3.resonance)?.label : 'Unmapped',
      aftercareNeed: this.answers.q24 ? RESONANCE_OPTIONS.find(r => r.id === this.answers.q24.resonance)?.label : 'Core Grounding'
    };

    this.profile = {
      nodes,
      baselineSummary,
      trackMode: this.quizMode,
      answeredCount: activeQs.filter(q => Boolean(this.answers[q.id])).length,
      totalQuestions: activeQs.length,
      timestamp: Date.now()
    };
    const sortedDrivers = Object.keys(DRIVERS).sort((a, b) => nodes[b].score - nodes[a].score);
    this.selectedNodeId = sortedDrivers[0] || 'surrender';
    this.persistVault();
  },

  // =========================================================================
  // LIVING DESIRE MAP: LIVE NODE RESONANCE & POLARITY ADJUSTMENT
  // =========================================================================
  updateLiveNodeState(nodeId, newResonanceId, newPolarityIdx) {
    if (!this.profile || !this.profile.nodes[nodeId] || nodeId === 'core') return;
    const current = this.profile.nodes[nodeId];

    const resMap = {
      core: { score: 92, fantasy: 0, tag: 'Embodied Reality' },
      curious: { score: 65, fantasy: 10, tag: 'Embodied Reality' },
      fantasy: { score: 58, fantasy: 85, tag: 'Fantasy-Leaning' },
      neutral: { score: 0, fantasy: 0, tag: 'Neutral / No Charge' },
      limit: { score: 0, fantasy: 0, tag: 'Hard Limit' }
    };

    let targetScore = current.score;
    let targetFantasy = current.fantasyRatio;
    let targetTag = current.statusTag;

    if (newResonanceId && resMap[newResonanceId]) {
      targetScore = resMap[newResonanceId].score;
      targetFantasy = resMap[newResonanceId].fantasy;
      targetTag = resMap[newResonanceId].tag;
    }

    const polIdx = newPolarityIdx !== undefined
      ? newPolarityIdx
      : current.polarity.startsWith('Receive')
      ? 0
      : current.polarity.startsWith('Give')
      ? 1
      : 2;

    let rec = 0;
    let give = 0;
    let polLabel = 'Switch / Both';

    if (targetScore > 0) {
      if (polIdx === 0) {
        rec = targetScore;
        give = Math.round(targetScore * 0.22);
        polLabel = 'Receive (Sub / Bottom)';
      } else if (polIdx === 1) {
        rec = Math.round(targetScore * 0.22);
        give = targetScore;
        polLabel = 'Give (Dom / Top)';
      } else {
        rec = Math.round(targetScore * 0.92);
        give = Math.round(targetScore * 0.92);
        polLabel = 'Switch / Both';
      }
    }

    this.profile.nodes[nodeId] = {
      ...current,
      score: targetScore,
      receivingScore: rec,
      givingScore: give,
      fantasyRatio: targetFantasy,
      isPrimarilyFantasy: targetFantasy >= 55 && targetScore > 0,
      polarity: polLabel,
      statusTag: targetTag
    };
    this.profile.timestamp = Date.now();
    this.persistVault();
    this.renderInsightPanel();
    this.showToast(`Updated ${ALL_NODES_MAP[nodeId]?.shortLabel || nodeId} on living map`);
  },

  getArchetypeTitle(prof) {
    if (!prof) return 'Holistic Desire Explorer';
    const sorted = Object.keys(DRIVERS).sort((a, b) => (prof.nodes[b]?.score || 0) - (prof.nodes[a]?.score || 0));
    const top2 = sorted.slice(0, 2).map(k => DRIVERS[k].shortLabel);
    const topStats = prof.nodes[sorted[0]];
    const polTag = topStats?.polarity?.startsWith('Receive')
      ? 'Receptive'
      : topStats?.polarity?.startsWith('Give')
      ? 'Guiding'
      : 'Fluid';
    return `${polTag} ${top2[0]} × ${top2[1]} Blueprint`;
  },

  encodeProfile(prof, scope = 'full') {
    if (!prof) return '';
    const compact = {};
    const sortedDrivers = Object.keys(DRIVERS).sort((a, b) => (prof.nodes[b]?.score || 0) - (prof.nodes[a]?.score || 0));
    const top3Drivers = new Set(sortedDrivers.slice(0, 3));

    Object.entries(prof.nodes).forEach(([k, v]) => {
      if (k === 'core') return;
      const isLimit = v.statusTag === 'Hard Limit';
      if (scope === 'vibe' && !top3Drivers.has(k) && !isLimit) {
        return; // First-Date Vibe Card shares only Top 3 Drivers + Hard Limits
      }
      const polCode = v.polarity.startsWith('Receive') ? 0 : v.polarity.startsWith('Give') ? 1 : 2;
      const statusCode = isLimit ? 1 : 0;
      compact[k] = [
        v.score,
        v.fantasyRatio,
        polCode,
        v.receivingScore ?? v.score,
        v.givingScore ?? v.score,
        statusCode
      ];
    });
    return btoa(JSON.stringify(compact));
  },

  decodeProfile(str) {
    try {
      const clean = str.includes('#synapse=') ? str.split('#synapse=')[1] : str.trim();
      const parsed = JSON.parse(atob(clean));
      const nodes = {
        core: {
          id: 'core',
          score: 100,
          receivingScore: 100,
          givingScore: 100,
          fantasyRatio: 0,
          isPrimarilyFantasy: false,
          polarity: 'Integrated Blueprint',
          statusTag: 'Active Hub'
        }
      };

      const allIds = [...Object.keys(DRIVERS), ...ACTIVITIES.map(a => a.id)];
      allIds.forEach(k => {
        const arr = parsed[k];
        if (!arr) {
          nodes[k] = {
            id: k,
            score: 0,
            receivingScore: 0,
            givingScore: 0,
            fantasyRatio: 0,
            isPrimarilyFantasy: false,
            polarity: 'Switch / Both',
            statusTag: 'Scoped / Hidden'
          };
          return;
        }
        const score = Number(arr[0]) || 0;
        const polCode = arr[2];
        const rec = arr[3] !== undefined ? Number(arr[3]) : (polCode === 1 ? Math.round(score * 0.2) : score);
        const give = arr[4] !== undefined ? Number(arr[4]) : (polCode === 0 ? Math.round(score * 0.2) : score);
        const isLimit = arr[5] === 1;
        nodes[k] = {
          id: k,
          score,
          receivingScore: rec,
          givingScore: give,
          fantasyRatio: Number(arr[1]) || 0,
          isPrimarilyFantasy: (Number(arr[1]) || 0) >= 55,
          polarity: polCode === 0 ? 'Receive (Sub / Bottom)' : polCode === 1 ? 'Give (Dom / Top)' : 'Switch / Both',
          statusTag: isLimit ? 'Hard Limit' : score > 0 ? 'Embodied Reality' : 'Neutral / No Charge'
        };
      });

      return {
        nodes,
        name: 'Linked Partner',
        baselineSummary: {
          cognitiveRest: 'Shared Signature',
          sensoryFocus: 'Shared Signature',
          containmentNeed: 'Shared Signature',
          aftercareNeed: 'Mutual Grounding'
        }
      };
    } catch (e) {
      return null;
    }
  },
};
