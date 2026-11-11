export const quizQuestions = [
  { id: 'recall', question: 'Which approach helps you remember information by practicing retrieval?', options: ['Re-reading the same page several times', 'Active recall with notes closed', 'Highlighting every paragraph', 'Studying only the night before'], answer: 1 },
  { id: 'breakdown', question: 'What is a good first step when a project feels overwhelming?', options: ['Wait for inspiration', 'Break it into a small next action', 'Work on everything at once', 'Skip planning entirely'], answer: 1 },
  { id: 'breaks', question: 'Why are short breaks useful during focused study?', options: ['They help restore attention', 'They make the work disappear', 'They replace sleep', 'They guarantee a perfect score'], answer: 0 },
  { id: 'spacing', question: 'Which schedule is most likely to support long-term learning?', options: ['One long session once a month', 'Several shorter sessions over time', 'Only reviewing the day before', 'No review after class'], answer: 1 },
  { id: 'understanding', question: 'When checking your understanding, which question is most useful?', options: ['Did I read every line?', 'Can I explain this idea in my own words?', 'Did I copy all the slides?', 'Was the session long enough?'], answer: 1 },
  { id: 'goal', question: 'What makes a study goal easier to act on?', options: ['Keeping it vague', 'Choosing one specific task and a time', 'Adding as many tasks as possible', 'Waiting until the week is over'], answer: 1 },
  { id: 'feedback', question: 'If a practice answer is wrong, what is a helpful next step?', options: ['Ignore it and move on', 'Check why and try a similar problem', 'Stop studying that topic forever', 'Memorize the letter only'], answer: 1 },
  { id: 'routine', question: 'Which is a realistic way to build a steady routine?', options: ['Start with a manageable habit', 'Change every habit in one day', 'Study only when you feel like it', 'Set goals you cannot measure'], answer: 0 }
];

export const publicQuiz = () => quizQuestions.map(({ id, question, options }) => ({ id, question, options }));
