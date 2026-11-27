// Quiz flow: start, navigation, answer selection, demo profile.
import { QUICK_PULSE_IDS, QUESTIONS } from '../data/questions.js';

export const quizMethods = {
  getActiveQuestions() {
    if (this.quizMode === 'quick') {
      return QUESTIONS.filter(q => QUICK_PULSE_IDS.includes(q.id));
    }
    return QUESTIONS;
  },

  startQuiz(mode = 'full') {
    this.destroyGraph();
    this.quizMode = mode === 'quick' ? 'quick' : 'full';
    this.currentQIndex = 0;
    this.answers = {};
    this.partnerProfile = null;
    this.activePresetKey = null;
    this.view = 'quiz';
    this.render();
    this.showToast(
      this.quizMode === 'quick'
        ? 'Started Quick Pulse (10 high-signal scenarios)'
        : 'Started Full Deep Dive (24 scenarios across 4 chapters)'
    );
  },

  jumpToChapter(chapterIdx) {
    const activeQs = this.getActiveQuestions();
    const firstIdx = activeQs.findIndex(q => q.chapter === chapterIdx);
    if (firstIdx !== -1) {
      this.currentQIndex = firstIdx;
      this.render();
    }
  },

  finishEarlyAndViewMap() {
    const activeQs = this.getActiveQuestions();
    const answeredCount = activeQs.filter(q => Boolean(this.answers[q.id])).length;
    if (answeredCount < 3) {
      this.showToast('Answer at least 3 scenarios to illuminate your initial map');
      return;
    }
    this.computeProfile();
    this.polarityView = 'overlay';
    this.filterMode = 'all';
    this.view = 'graph';
    this.render();
    this.showToast(`Map generated from ${answeredCount} of ${activeQs.length} scenarios`);
  },

  loadDemoProfile() {
    this.quizMode = 'full'; // demo answers cover all 24 questions
    this.answers = {
      q1: { resonance: 'core', polarity: 0 },
      q2: { resonance: 'core', polarity: 0 },
      q3: { resonance: 'core', polarity: 2 },
      q4: { resonance: 'curious', polarity: 2 },
      q5: { resonance: 'core', polarity: 0 },
      q6: { resonance: 'curious', polarity: 2 },
      q7: { resonance: 'core', polarity: 2 },
      q8: { resonance: 'fantasy', polarity: 0 },
      q9: { resonance: 'curious', polarity: 2 },
      q10: { resonance: 'curious', polarity: 0 },
      q11: { resonance: 'core', polarity: 0 },
      q12: { resonance: 'core', polarity: 0 },
      q13: { resonance: 'limit', polarity: 0 },
      q14: { resonance: 'core', polarity: 0 },
      q15: { resonance: 'curious', polarity: 0 },
      q16: { resonance: 'core', polarity: 2 },
      q17: { resonance: 'fantasy', polarity: 0 },
      q18: { resonance: 'core', polarity: 0 },
      q19: { resonance: 'curious', polarity: 0 },
      q20: { resonance: 'curious', polarity: 0 },
      q21: { resonance: 'curious', polarity: 0 },
      q22: { resonance: 'core', polarity: 0 },
      q23: { resonance: 'core', polarity: 0 },
      q24: { resonance: 'core', polarity: 2 }
    };
    this.computeProfile();
    this.polarityView = 'overlay';
    this.filterMode = 'all';
    this.view = 'graph';
    this.render();
    this.showToast('Demo Holistic Neural Map illuminated');
  },

  selectAnswer(resonanceId) {
    const activeQs = this.getActiveQuestions();
    const q = activeQs[this.currentQIndex];
    if (!q) return;
    const existingPol = this.answers[q.id]?.polarity ?? 0;
    this.answers[q.id] = {
      resonance: resonanceId,
      polarity: existingPol
    };
    this.render();
  },

  selectPolarity(polIndex) {
    const activeQs = this.getActiveQuestions();
    const q = activeQs[this.currentQIndex];
    if (!q) return;
    const existingRes = this.answers[q.id]?.resonance ?? 'core';
    this.answers[q.id] = {
      resonance: existingRes,
      polarity: polIndex
    };
    this.render();
  },

  prevQuestion() {
    if (this.currentQIndex > 0) {
      this.currentQIndex--;
      this.render();
    } else {
      this.goHome();
    }
  },

  nextQuestion() {
    const activeQs = this.getActiveQuestions();
    const q = activeQs[this.currentQIndex];
    if (!q) return;
    if (!this.answers[q.id]) {
      this.showToast('Select a resonance level to continue');
      return;
    }
    if (this.currentQIndex < activeQs.length - 1) {
      this.currentQIndex++;
      this.render();
    } else {
      this.computeProfile();
      this.polarityView = 'overlay';
      this.filterMode = 'all';
      this.view = 'graph';
      this.render();
    }
  },
};
