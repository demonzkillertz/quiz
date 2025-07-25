import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const QuizRules: React.FC = () => {
  const [rulePageIndex, setRulePageIndex] = useState(0);

  const rules = [
    {
      title: 'General Rules',
      content: (
        <ul className="list-disc pl-6">
          <li>There will be three rounds: General Round, Audio-Visual Round, and Rapid Fire Round in this quiz contest.</li>
          <li>Questions in the quiz will be asked either in Nepali or in English.</li>
          <li>Answer should be provided by group leader only, except for Rapid Fire Round.</li>
          <li>If other member of the group or other person in the audience answers question, the question will be cancelled, and a new question will be asked to the group.</li>
          <li>Any issue raised against question or answer will be settled by the jury. The jury’s decision will be the final one.</li>
        </ul>
      )
    },
    {
      title: 'Rules for General Round',
      content: (
        <ul className="list-disc pl-6">
          <li>There will be 25 questions in total in this round, and there will be five rounds.</li>
          <li>All five groups are allowed to choose question number in their turn. And they will be asked question of the selected question number. The order of turn to select question number will be forward (A → B → C → D → E) and backward (E → D → C → B → A) in Pendulum system. If any of five groups could not answer, the question will be asked to audience.</li>
          <li>30 seconds will be provided to answer for the group which has chosen the question. If this group cannot answer in given time or answers incorrectly, then the question will be passed to next group. 10 seconds will be provided to answer the passed question for remaining groups. Incomplete answer will be considered wrong answer.</li>
          <li>Each correct answer will be awarded 10 points for the first hand question but correct answer to the passed question gets 5 points.</li>
        </ul>
      )
    },
    {
      title: 'Rules for Audio-Visual Round',
      content: (
        <ul className="list-disc pl-6">
          <li>In Audio-Visual Round, each correct answer to first hand question gets 15 scores and 10 points for correct answer to the passed question. But 5 points will be deducted if the answer is wrong.</li>
        </ul>
      )
    },
    {
      title: 'Rules for Rapid Fire Round',
      content: (
        <ul className="list-disc pl-6">
          <li>Any member in the group can answer, but if two or more answer the same question at a time the question will be cancelled and no substitution question.</li>
          <li>Maximum of 10 questions will be asked for each group in 1 minute.</li>
          <li>For each correct answer a total of 10 points will be awarded.</li>
        </ul>
      )
    },
    {
      title: 'Question for Audience',
      content: (
        <ul className="list-disc pl-6">
          <li>If any of five participating groups could not answer a question in General Round and Audio-Visual Round, the question will be passed to audience.</li>
          <li>Chance to answer will be given to the person who raises his/her hand.</li>
          <li>Five more questions will be asked to audience. One after General Round, one after each audio, visual and image round and last after Rapid Fire Round.</li>
          <li>If there is tie in any groups, more questions will be asked to select winner. If there is again same score, jury will decide the procedure then and there.</li>
        </ul>
      )
    }
  ];

  const handlePreviousRule = () => {
    if (rulePageIndex > 0) {
      setRulePageIndex(rulePageIndex - 1);
    }
  };

  const handleNextRule = () => {
    if (rulePageIndex < rules.length - 1) {
      setRulePageIndex(rulePageIndex + 1);
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8 overflow-hidden">
      <div className="text-center max-w-4xl">
        <h1 className="text-5xl font-bold mb-8 text-blue-400">Quiz Rules</h1>
        <div className="text-left text-xl space-y-4">
          <h2 className="text-2xl font-semibold text-blue-300">{rules[rulePageIndex].title}</h2>
          {rules[rulePageIndex].content}
        </div>
        <div className="flex justify-between mt-8">
          <button
            onClick={handlePreviousRule}
            disabled={rulePageIndex === 0}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            <ChevronLeft size={20} />
            Previous
          </button>
          <span className="text-lg">{rulePageIndex + 1} / {rules.length}</span>
          <button
            onClick={handleNextRule}
            disabled={rulePageIndex === rules.length - 1}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            Next
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizRules;