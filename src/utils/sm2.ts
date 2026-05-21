export interface SM2State {
  interval: number; // in days
  repetitions: number;
  easeFactor: number;
  nextReviewDate: string; // ISO string
}

/**
 * Calculates the next SM-2 state based on the current state and review quality score.
 * @param rating Quality score from 0 to 5:
 *               0: Complete blackout
 *               1: Incorrect, but familiar
 *               2: Incorrect, but easy to recall when shown
 *               3: Correct, but recalled with serious difficulty (Hard)
 *               4: Correct, after hesitation (Good)
 *               5: Correct, perfect recall (Easy)
 */
export function calculateSM2(currentState: SM2State, rating: number): SM2State {
  let { interval, repetitions, easeFactor } = { ...currentState };

  // Calculate new ease factor
  easeFactor = easeFactor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02));
  if (easeFactor < 1.3) {
    easeFactor = 1.3;
  }

  if (rating < 3) {
    // Forgot/incorrect response
    repetitions = 0;
    interval = 1;
  } else {
    // Correct response
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.ceil(interval * easeFactor);
    }
    repetitions = repetitions + 1;
  }

  // Calculate next review date
  const nextReviewDateObj = new Date();
  nextReviewDateObj.setDate(nextReviewDateObj.getDate() + interval);

  return {
    interval,
    repetitions,
    easeFactor,
    nextReviewDate: nextReviewDateObj.toISOString(),
  };
}
