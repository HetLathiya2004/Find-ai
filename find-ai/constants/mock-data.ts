// ---------------------------------------------------------------------------
// Phase 1 mock data — no network calls. Everything the UI needs lives here.
// ---------------------------------------------------------------------------

export type Domain = 'markets' | 'investing' | 'macro' | 'corporate_finance';

export interface MockUser {
  id: string;
  display_name: string;
  email: string;
  goal: 'grow_wealth' | 'understand_news' | 'learn_basics';
  daily_goal_minutes: 5 | 10 | 15;
  xp: number;
  level: number;
  streak_count: number;
  streak_best: number;
  streak_last_date: string;
  streak_freeze_count: number;
}

export const MOCK_USER: MockUser = {
  id: 'user-1',
  display_name: 'Alex',
  email: 'alex@example.com',
  goal: 'grow_wealth',
  daily_goal_minutes: 10,
  xp: 1450,
  level: 5,
  streak_count: 7,
  streak_best: 12,
  streak_last_date: '2026-07-01',
  streak_freeze_count: 2,
};

export interface MockConcept {
  id: string;
  title: string;
  slug: string;
  description: string;
  domain: Domain;
  order_index: number;
  mastery_level: number; // 0-5
}

export const MOCK_CONCEPTS: MockConcept[] = [
  {
    id: 'c1',
    title: 'Supply and Demand',
    slug: 'supply-and-demand',
    description:
      'The fundamental forces that drive prices in every market. Understanding how supply and demand interact is the foundation of all economic thinking — from stock prices to the cost of your morning coffee.',
    domain: 'markets',
    order_index: 1,
    mastery_level: 3,
  },
  {
    id: 'c2',
    title: 'Compound Interest',
    slug: 'compound-interest',
    description:
      'How money grows exponentially over time. Einstein allegedly called it the eighth wonder of the world — those who understand it, earn it; those who don\u2019t, pay it.',
    domain: 'investing',
    order_index: 2,
    mastery_level: 1,
  },
  {
    id: 'c3',
    title: 'Inflation',
    slug: 'inflation',
    description:
      'Why prices rise and what it means for your money. Inflation quietly erodes purchasing power — learn how it\u2019s measured, what causes it, and how to protect yourself.',
    domain: 'macro',
    order_index: 3,
    mastery_level: 2,
  },
  {
    id: 'c4',
    title: 'P/E Ratio',
    slug: 'pe-ratio',
    description:
      'How to value a company by its earnings. The price-to-earnings ratio is the most widely used valuation metric — learn to read it and spot expensive vs. cheap stocks.',
    domain: 'corporate_finance',
    order_index: 4,
    mastery_level: 0,
  },
  {
    id: 'c5',
    title: 'Market Orders vs. Limit Orders',
    slug: 'market-vs-limit-orders',
    description:
      'The two fundamental ways to buy and sell securities. Knowing when to use each order type can save you money and protect you from volatile price swings.',
    domain: 'markets',
    order_index: 5,
    mastery_level: 2,
  },
  {
    id: 'c6',
    title: 'Diversification',
    slug: 'diversification',
    description:
      'Why you shouldn\u2019t put all your eggs in one basket. Diversification is the only free lunch in investing — reduce risk without sacrificing expected returns.',
    domain: 'investing',
    order_index: 6,
    mastery_level: 4,
  },
  {
    id: 'c7',
    title: 'Interest Rates',
    slug: 'interest-rates',
    description:
      'The price of money itself. Central bank rates ripple through mortgages, savings accounts, stock valuations, and the entire economy.',
    domain: 'macro',
    order_index: 7,
    mastery_level: 1,
  },
  {
    id: 'c8',
    title: 'Balance Sheets',
    slug: 'balance-sheets',
    description:
      'A snapshot of what a company owns and owes. Reading a balance sheet reveals financial health that headlines and hype can hide.',
    domain: 'corporate_finance',
    order_index: 8,
    mastery_level: 0,
  },
  {
    id: 'c9',
    title: 'Bull and Bear Markets',
    slug: 'bull-and-bear-markets',
    description:
      'The emotional cycles of markets. Learn what defines bull and bear markets, how long they typically last, and how investors behave in each.',
    domain: 'markets',
    order_index: 9,
    mastery_level: 0,
  },
  {
    id: 'c10',
    title: 'Index Funds',
    slug: 'index-funds',
    description:
      'The simplest way to own the whole market. Index funds beat most professional money managers over the long run — understand why.',
    domain: 'investing',
    order_index: 10,
    mastery_level: 0,
  },
  {
    id: 'c11',
    title: 'GDP',
    slug: 'gdp',
    description:
      'How we measure the size of an economy. Gross Domestic Product drives policy decisions, market sentiment, and headlines — learn what it captures and what it misses.',
    domain: 'macro',
    order_index: 11,
    mastery_level: 0,
  },
  {
    id: 'c12',
    title: 'Cash Flow',
    slug: 'cash-flow',
    description:
      'Why profit isn\u2019t the same as cash. Companies fail from running out of cash, not from lack of accounting profits — learn to follow the money.',
    domain: 'corporate_finance',
    order_index: 12,
    mastery_level: 0,
  },
];

export interface MockLessonCard {
  title: string;
  body: string;
  visual_hint: string | null;
}

export interface MockLesson {
  id: string;
  title: string;
  slug: string;
  concept_id: string;
  xp_reward: number;
  cards: MockLessonCard[];
}

export const MOCK_LESSONS: MockLesson[] = [
  {
    id: 'l1',
    title: 'Understanding Supply and Demand',
    slug: 'supply-and-demand',
    concept_id: 'c1',
    xp_reward: 25,
    cards: [
      {
        title: 'What is Supply?',
        body: 'Supply is the total amount of a good or service available to consumers. When supply increases and demand stays the same, prices tend to fall.',
        visual_hint: null,
      },
      {
        title: 'What is Demand?',
        body: 'Demand represents how much consumers want a product at various price points. As price drops, demand typically rises.',
        visual_hint: 'Price \u2193 = Demand \u2191\nPrice \u2191 = Demand \u2193',
      },
      {
        title: 'Equilibrium',
        body: 'The equilibrium price is where supply meets demand. This is the "market price" — the point where sellers and buyers agree.',
        visual_hint: 'Supply curve \u2197 meets Demand curve \u2198\n\u2192 Equilibrium point (P*, Q*)',
      },
      {
        title: 'Real World Example',
        body: 'When a new iPhone launches, demand is high but supply is limited. Prices stay high. Months later, supply catches up and prices drop.',
        visual_hint: null,
      },
    ],
  },
  {
    id: 'l2',
    title: 'The Magic of Compound Interest',
    slug: 'compound-interest',
    concept_id: 'c2',
    xp_reward: 25,
    cards: [
      {
        title: 'Simple vs. Compound',
        body: 'Simple interest pays only on your original deposit. Compound interest pays on your deposit plus all the interest you\u2019ve already earned — interest on interest.',
        visual_hint: 'Simple: $100 \u2192 $110 \u2192 $120\nCompound: $100 \u2192 $110 \u2192 $121',
      },
      {
        title: 'The Snowball Effect',
        body: 'At first, compounding feels slow. But growth accelerates over time. $10,000 at 7% becomes $19,700 in 10 years — and $76,100 in 30 years.',
        visual_hint: null,
      },
      {
        title: 'The Rule of 72',
        body: 'Divide 72 by your annual return to estimate how many years it takes your money to double. At 8%, your money doubles roughly every 9 years.',
        visual_hint: '72 \u00f7 8% = 9 years to double',
      },
      {
        title: 'Time Beats Timing',
        body: 'Starting early matters more than picking perfect investments. A 25-year-old investing $200/month typically ends up with far more than a 35-year-old investing $400/month.',
        visual_hint: null,
      },
    ],
  },
  {
    id: 'l3',
    title: 'Inflation Basics',
    slug: 'inflation',
    concept_id: 'c3',
    xp_reward: 25,
    cards: [
      {
        title: 'What is Inflation?',
        body: 'Inflation is the rate at which prices rise across the economy. If inflation runs at 3%, something that cost $100 last year costs $103 today.',
        visual_hint: null,
      },
      {
        title: 'Why Does it Happen?',
        body: 'Inflation happens when demand outpaces supply, when production costs rise, or when there\u2019s too much money chasing too few goods.',
        visual_hint: 'More money + Same goods\n= Higher prices',
      },
      {
        title: 'The Silent Tax',
        body: 'Cash loses purchasing power to inflation every year. $10,000 under a mattress at 3% inflation is worth only about $7,400 in real terms after 10 years.',
        visual_hint: null,
      },
      {
        title: 'How to Protect Yourself',
        body: 'Assets like stocks, real estate, and inflation-protected bonds historically outpace inflation. Holding too much cash for too long is a hidden risk.',
        visual_hint: null,
      },
    ],
  },
  {
    id: 'l4',
    title: 'Reading the P/E Ratio',
    slug: 'pe-ratio',
    concept_id: 'c4',
    xp_reward: 25,
    cards: [
      {
        title: 'The Formula',
        body: 'The P/E ratio divides a company\u2019s share price by its earnings per share. It tells you how many dollars you pay for each dollar of annual profit.',
        visual_hint: 'P/E = Share Price \u00f7 Earnings Per Share',
      },
      {
        title: 'What is "Expensive"?',
        body: 'A P/E of 30 means investors pay $30 for $1 of earnings. High P/E often signals expected growth; low P/E may signal trouble — or a bargain.',
        visual_hint: null,
      },
      {
        title: 'Context Matters',
        body: 'Compare P/E within industries. Tech companies often trade at 25-40x earnings while utilities trade at 10-15x. Neither is "wrong" — they grow differently.',
        visual_hint: 'Tech: ~25-40x\nUtilities: ~10-15x\nS&P 500 average: ~16-20x',
      },
      {
        title: 'The Limitations',
        body: 'P/E breaks down for companies with no earnings, and can be distorted by one-off events. It\u2019s a starting point for valuation, not the final answer.',
        visual_hint: null,
      },
    ],
  },
  {
    id: 'l5',
    title: 'Market Orders vs. Limit Orders',
    slug: 'market-vs-limit-orders',
    concept_id: 'c5',
    xp_reward: 25,
    cards: [
      {
        title: 'Market Orders',
        body: 'A market order executes immediately at the best available price. You\u2019re guaranteed the trade happens, but not the exact price you\u2019ll get.',
        visual_hint: null,
      },
      {
        title: 'Limit Orders',
        body: 'A limit order sets the maximum price you\u2019ll pay (or minimum you\u2019ll accept). You control the price, but the trade might never execute.',
        visual_hint: 'Buy limit @ $50\n\u2192 executes only at $50 or below',
      },
      {
        title: 'When to Use Each',
        body: 'Use market orders for liquid stocks when speed matters. Use limit orders for volatile or thinly traded stocks where prices can jump between quotes.',
        visual_hint: null,
      },
    ],
  },
  {
    id: 'l6',
    title: 'Why Diversification Works',
    slug: 'diversification',
    concept_id: 'c6',
    xp_reward: 25,
    cards: [
      {
        title: 'The Core Idea',
        body: 'Diversification means spreading investments across assets that don\u2019t move together. When one falls, others may hold steady or rise.',
        visual_hint: null,
      },
      {
        title: 'Correlation is Key',
        body: 'Owning 10 tech stocks isn\u2019t diversification — they tend to move together. True diversification mixes stocks, bonds, geographies, and sectors.',
        visual_hint: '10 tech stocks \u2260 diversified\nStocks + bonds + intl = diversified',
      },
      {
        title: 'The Free Lunch',
        body: 'Diversification can lower portfolio risk without lowering expected returns. It\u2019s the closest thing to a free lunch in all of finance.',
        visual_hint: null,
      },
    ],
  },
  {
    id: 'l7',
    title: 'How Interest Rates Move Everything',
    slug: 'interest-rates',
    concept_id: 'c7',
    xp_reward: 25,
    cards: [
      {
        title: 'The Price of Money',
        body: 'Interest rates are what borrowers pay to use money. Central banks set a baseline rate that influences every other rate in the economy.',
        visual_hint: null,
      },
      {
        title: 'Rates and Stocks',
        body: 'Higher rates make bonds more attractive and borrowing more expensive, which typically pressures stock prices — especially growth stocks.',
        visual_hint: 'Rates \u2191 \u2192 borrowing costs \u2191\n\u2192 growth stocks \u2193',
      },
      {
        title: 'Rates and You',
        body: 'Rate changes hit your life directly: mortgage payments, credit card APRs, savings account yields, and car loans all follow the central bank\u2019s lead.',
        visual_hint: null,
      },
    ],
  },
  {
    id: 'l8',
    title: 'Balance Sheets Decoded',
    slug: 'balance-sheets',
    concept_id: 'c8',
    xp_reward: 25,
    cards: [
      {
        title: 'The Equation',
        body: 'Every balance sheet follows one rule: assets equal liabilities plus equity. What a company owns is funded by what it owes plus what shareholders invested.',
        visual_hint: 'Assets = Liabilities + Equity',
      },
      {
        title: 'Assets',
        body: 'Assets are what the company owns: cash, inventory, buildings, patents. Current assets convert to cash within a year; long-term assets take longer.',
        visual_hint: null,
      },
      {
        title: 'Red Flags',
        body: 'Watch for debt growing faster than assets, shrinking cash, or ballooning inventory. The balance sheet often reveals stress before the income statement does.',
        visual_hint: null,
      },
    ],
  },
  {
    id: 'l9',
    title: 'Bull and Bear Markets Explained',
    slug: 'bull-and-bear-markets',
    concept_id: 'c9',
    xp_reward: 25,
    cards: [
      {
        title: 'The Definitions',
        body: 'A bull market is a rise of 20% or more from recent lows. A bear market is a drop of 20% or more from recent highs. The names describe how each animal attacks.',
        visual_hint: 'Bull: horns thrust up \u2191\nBear: claws swipe down \u2193',
      },
      {
        title: 'How Long They Last',
        body: 'Historically, bull markets last about 5 years on average, while bear markets last about 10 months. Markets spend far more time rising than falling.',
        visual_hint: null,
      },
      {
        title: 'Investor Psychology',
        body: 'Bulls breed greed and FOMO; bears breed fear and panic selling. The best investors do the opposite of the crowd at extremes.',
        visual_hint: null,
      },
    ],
  },
  {
    id: 'l10',
    title: 'The Case for Index Funds',
    slug: 'index-funds',
    concept_id: 'c10',
    xp_reward: 25,
    cards: [
      {
        title: 'What is an Index Fund?',
        body: 'An index fund owns every stock in a market index, like the S&P 500, in proportion. One purchase gives you a slice of hundreds of companies.',
        visual_hint: null,
      },
      {
        title: 'Why They Win',
        body: 'Over 15-year periods, roughly 90% of professional fund managers fail to beat their benchmark index — largely because of fees and trading costs.',
        visual_hint: '~90% of pros lose to the index\nover 15 years',
      },
      {
        title: 'The Cost Advantage',
        body: 'Index funds charge as little as 0.03% per year versus 1%+ for active funds. On $100,000 over 30 years, that difference compounds to tens of thousands of dollars.',
        visual_hint: null,
      },
    ],
  },
  {
    id: 'l11',
    title: 'GDP in Five Minutes',
    slug: 'gdp',
    concept_id: 'c11',
    xp_reward: 25,
    cards: [
      {
        title: 'The Definition',
        body: 'GDP measures the total value of all goods and services produced in a country in a given period. It\u2019s the standard scoreboard for economic size.',
        visual_hint: 'GDP = C + I + G + (X \u2212 M)',
      },
      {
        title: 'Growth Matters',
        body: 'Markets care about the growth rate, not the level. 3% growth signals a healthy economy; two consecutive quarters of shrinking GDP defines a recession.',
        visual_hint: null,
      },
      {
        title: 'What GDP Misses',
        body: 'GDP ignores unpaid work, inequality, and environmental costs. A country can have rising GDP while most citizens feel worse off.',
        visual_hint: null,
      },
    ],
  },
  {
    id: 'l12',
    title: 'Following the Cash',
    slug: 'cash-flow',
    concept_id: 'c12',
    xp_reward: 25,
    cards: [
      {
        title: 'Profit vs. Cash',
        body: 'A company can report profits while running out of cash — customers may owe money that hasn\u2019t arrived yet. Cash flow tracks actual money moving in and out.',
        visual_hint: null,
      },
      {
        title: 'Three Buckets',
        body: 'Cash flow splits into operating (the core business), investing (buying equipment, acquisitions), and financing (debt, dividends, buybacks).',
        visual_hint: 'Operating + Investing + Financing\n= Net change in cash',
      },
      {
        title: 'Free Cash Flow',
        body: 'Free cash flow is operating cash minus capital expenditures — the money truly available to shareholders. Many investors trust it more than reported earnings.',
        visual_hint: 'FCF = Operating cash \u2212 CapEx',
      },
    ],
  },
];

export interface MockQuizQuestion {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

export interface MockQuiz {
  id: string;
  lesson_id: string;
  concept_id: string;
  xp_reward: number;
  pass_threshold: number;
  questions: MockQuizQuestion[];
}

export const MOCK_QUIZZES: MockQuiz[] = [
  {
    id: 'q1',
    lesson_id: 'l1',
    concept_id: 'c1',
    xp_reward: 30,
    pass_threshold: 70,
    questions: [
      {
        question: 'What happens to prices when supply increases and demand stays the same?',
        options: ['Prices rise', 'Prices fall', 'Prices stay the same', 'It depends on the product'],
        correct_index: 1,
        explanation: 'When there is more supply than demand, sellers compete by lowering prices.',
      },
      {
        question: 'What is the equilibrium price?',
        options: [
          'The highest price a buyer will pay',
          'The lowest price a seller will accept',
          'Where supply meets demand',
          'The government-set price',
        ],
        correct_index: 2,
        explanation: 'Equilibrium is where the supply and demand curves intersect.',
      },
      {
        question: 'If a popular toy sells out during the holidays, what likely happens?',
        options: [
          'The price drops',
          'Demand decreases',
          'Resale prices increase',
          'Supply increases immediately',
        ],
        correct_index: 2,
        explanation: 'Limited supply + high demand = higher prices, especially on resale markets.',
      },
    ],
  },
  {
    id: 'q2',
    lesson_id: 'l2',
    concept_id: 'c2',
    xp_reward: 30,
    pass_threshold: 70,
    questions: [
      {
        question: 'What makes compound interest different from simple interest?',
        options: [
          'It has a higher interest rate',
          'You earn interest on previously earned interest',
          'It is only available at banks',
          'It is calculated monthly',
        ],
        correct_index: 1,
        explanation: 'Compounding pays interest on your principal plus all past interest — that\u2019s the snowball.',
      },
      {
        question: 'Using the Rule of 72, how long does money take to double at 6% per year?',
        options: ['6 years', '9 years', '12 years', '72 years'],
        correct_index: 2,
        explanation: '72 \u00f7 6 = 12 years. The Rule of 72 gives a quick doubling estimate.',
      },
      {
        question: 'Why does starting to invest early matter so much?',
        options: [
          'Stocks were cheaper in the past',
          'Young people can pick better stocks',
          'More time means more compounding periods',
          'Interest rates fall over time',
        ],
        correct_index: 2,
        explanation: 'Compounding accelerates with time — early dollars have decades to snowball.',
      },
    ],
  },
  {
    id: 'q3',
    lesson_id: 'l3',
    concept_id: 'c3',
    xp_reward: 30,
    pass_threshold: 70,
    questions: [
      {
        question: 'If inflation is 3%, what happens to $100 in cash over one year?',
        options: [
          'It grows to $103',
          'Its purchasing power drops to about $97',
          'Nothing changes',
          'It becomes worthless',
        ],
        correct_index: 1,
        explanation: 'Inflation erodes what cash can buy — 3% inflation means your $100 buys about 3% less.',
      },
      {
        question: 'Which of these commonly causes inflation?',
        options: [
          'Too much money chasing too few goods',
          'Falling production costs',
          'Rising unemployment',
          'Increased savings rates',
        ],
        correct_index: 0,
        explanation: 'When money supply grows faster than goods and services, prices get bid up.',
      },
      {
        question: 'Which asset has historically protected against inflation best?',
        options: ['Cash under a mattress', 'A checking account', 'Stocks and real estate', 'Gift cards'],
        correct_index: 2,
        explanation: 'Productive assets like stocks and real estate tend to rise with (or faster than) prices.',
      },
    ],
  },
  {
    id: 'q4',
    lesson_id: 'l4',
    concept_id: 'c4',
    xp_reward: 30,
    pass_threshold: 70,
    questions: [
      {
        question: 'A stock trades at $60 with earnings per share of $3. What is its P/E?',
        options: ['3', '20', '60', '180'],
        correct_index: 1,
        explanation: 'P/E = Price \u00f7 EPS = $60 \u00f7 $3 = 20.',
      },
      {
        question: 'What does a high P/E ratio usually signal?',
        options: [
          'The company is bankrupt',
          'Investors expect strong future growth',
          'The stock pays a high dividend',
          'The company has no debt',
        ],
        correct_index: 1,
        explanation: 'Investors pay a premium for expected growth — though high P/E can also mean overvaluation.',
      },
      {
        question: 'Why should you compare P/E ratios within the same industry?',
        options: [
          'Different industries grow and earn differently',
          'It is required by law',
          'P/E only works for tech stocks',
          'Industries share the same earnings',
        ],
        correct_index: 0,
        explanation: 'A utility at 12x and a tech firm at 30x can both be fairly valued for their growth profiles.',
      },
    ],
  },
  {
    id: 'q5',
    lesson_id: 'l5',
    concept_id: 'c5',
    xp_reward: 30,
    pass_threshold: 70,
    questions: [
      {
        question: 'What does a market order guarantee?',
        options: ['The exact price', 'Immediate execution', 'No fees', 'A profit'],
        correct_index: 1,
        explanation: 'Market orders execute right away at the best available price — speed, not price, is guaranteed.',
      },
      {
        question: 'You place a buy limit order at $50. The stock trades at $55. What happens?',
        options: [
          'You buy at $55',
          'You buy at $50 immediately',
          'Nothing until the price falls to $50 or below',
          'The order is cancelled',
        ],
        correct_index: 2,
        explanation: 'A buy limit only executes at your limit price or better — it waits for $50 or lower.',
      },
      {
        question: 'When is a limit order most useful?',
        options: [
          'For highly liquid large-cap stocks',
          'For volatile or thinly traded stocks',
          'When you need to sell instantly',
          'Only during market close',
        ],
        correct_index: 1,
        explanation: 'Limit orders protect you from bad fills when prices swing or spreads are wide.',
      },
    ],
  },
  {
    id: 'q6',
    lesson_id: 'l6',
    concept_id: 'c6',
    xp_reward: 30,
    pass_threshold: 70,
    questions: [
      {
        question: 'Which portfolio is best diversified?',
        options: [
          '10 different tech stocks',
          '5 airlines and 5 hotels',
          'Stocks, bonds, and international assets',
          'One index fund and its ETF twin',
        ],
        correct_index: 2,
        explanation: 'True diversification mixes assets that don\u2019t move together — across classes and geographies.',
      },
      {
        question: 'Why is diversification called a "free lunch"?',
        options: [
          'It costs nothing to trade',
          'It reduces risk without lowering expected returns',
          'Brokers offer it free',
          'It guarantees profits',
        ],
        correct_index: 1,
        explanation: 'By combining uncorrelated assets you can cut volatility while keeping return expectations.',
      },
      {
        question: 'What matters most when picking assets to diversify?',
        options: ['Their correlation to each other', 'Their ticker symbols', 'Their price per share', 'Their age'],
        correct_index: 0,
        explanation: 'Low or negative correlation is what actually smooths portfolio swings.',
      },
    ],
  },
  {
    id: 'q7',
    lesson_id: 'l7',
    concept_id: 'c7',
    xp_reward: 30,
    pass_threshold: 70,
    questions: [
      {
        question: 'Who sets the baseline interest rate in an economy?',
        options: ['The largest commercial bank', 'The central bank', 'The stock exchange', 'The government treasury only'],
        correct_index: 1,
        explanation: 'Central banks (like the Federal Reserve) set the policy rate everything else keys off.',
      },
      {
        question: 'What typically happens to growth stocks when rates rise sharply?',
        options: ['They rise', 'They fall', 'Nothing', 'They convert to bonds'],
        correct_index: 1,
        explanation: 'Higher rates discount future earnings more heavily, hitting growth stocks hardest.',
      },
      {
        question: 'Which of these is directly affected by central bank rate changes?',
        options: ['Mortgage rates', 'Movie ticket prices', 'The weather', 'Sports scores'],
        correct_index: 0,
        explanation: 'Mortgages, credit cards, and savings yields all track the policy rate.',
      },
    ],
  },
  {
    id: 'q8',
    lesson_id: 'l8',
    concept_id: 'c8',
    xp_reward: 30,
    pass_threshold: 70,
    questions: [
      {
        question: 'What is the fundamental balance sheet equation?',
        options: [
          'Assets = Liabilities + Equity',
          'Revenue \u2212 Expenses = Profit',
          'Assets = Revenue \u2212 Debt',
          'Equity = Assets + Liabilities',
        ],
        correct_index: 0,
        explanation: 'Everything a company owns is funded by debt (liabilities) or owners\u2019 capital (equity).',
      },
      {
        question: 'Which is a current asset?',
        options: ['A factory building', 'A 10-year patent', 'Inventory', 'A long-term bond issued'],
        correct_index: 2,
        explanation: 'Current assets convert to cash within a year — inventory is meant to be sold soon.',
      },
      {
        question: 'Which balance sheet trend is a red flag?',
        options: [
          'Cash growing steadily',
          'Debt growing faster than assets',
          'Equity increasing',
          'Inventory matching sales growth',
        ],
        correct_index: 1,
        explanation: 'Debt outpacing assets means leverage is building — stress often shows here first.',
      },
    ],
  },
  {
    id: 'q9',
    lesson_id: 'l9',
    concept_id: 'c9',
    xp_reward: 30,
    pass_threshold: 70,
    questions: [
      {
        question: 'What defines a bear market?',
        options: [
          'A 10% drop from highs',
          'A 20% or greater drop from recent highs',
          'Any red trading day',
          'Three down weeks in a row',
        ],
        correct_index: 1,
        explanation: 'The standard definition is a decline of 20% or more from a recent peak.',
      },
      {
        question: 'Historically, which lasts longer?',
        options: ['Bear markets', 'Bull markets', 'They last the same', 'Neither has patterns'],
        correct_index: 1,
        explanation: 'Bull markets average about 5 years; bear markets average about 10 months.',
      },
      {
        question: 'What emotion typically dominates at bull market peaks?',
        options: ['Fear', 'Greed and FOMO', 'Boredom', 'Patience'],
        correct_index: 1,
        explanation: 'Euphoria and fear of missing out peak right when risk is highest.',
      },
    ],
  },
  {
    id: 'q10',
    lesson_id: 'l10',
    concept_id: 'c10',
    xp_reward: 30,
    pass_threshold: 70,
    questions: [
      {
        question: 'What does an S&P 500 index fund own?',
        options: [
          'Only the 10 biggest US stocks',
          'All 500 companies in the index, proportionally',
          'Government bonds',
          'Whatever the manager picks',
        ],
        correct_index: 1,
        explanation: 'Index funds replicate the whole index — one purchase buys the entire basket.',
      },
      {
        question: 'Roughly what share of professional managers beat their index over 15 years?',
        options: ['About 90%', 'About 50%', 'About 10%', 'All of them'],
        correct_index: 2,
        explanation: 'Only ~10% outperform long-term, largely because fees compound against them.',
      },
      {
        question: 'Why do low fees matter so much over decades?',
        options: [
          'Fees are tax deductible',
          'Fee differences compound just like returns',
          'They don\u2019t matter',
          'Low fees mean better managers',
        ],
        correct_index: 1,
        explanation: 'A 1% annual fee can consume a quarter of your final balance over 30 years.',
      },
    ],
  },
  {
    id: 'q11',
    lesson_id: 'l11',
    concept_id: 'c11',
    xp_reward: 30,
    pass_threshold: 70,
    questions: [
      {
        question: 'What does GDP measure?',
        options: [
          'Government debt',
          'Total value of goods and services produced',
          'Stock market capitalization',
          'Average personal income',
        ],
        correct_index: 1,
        explanation: 'GDP totals everything an economy produces in a period — the standard size scoreboard.',
      },
      {
        question: 'What commonly defines a recession?',
        options: [
          'One bad month for stocks',
          'Two consecutive quarters of shrinking GDP',
          'Rising GDP',
          'A government announcement',
        ],
        correct_index: 1,
        explanation: 'The rule-of-thumb definition is two straight quarters of negative GDP growth.',
      },
      {
        question: 'Which of these does GDP fail to capture?',
        options: ['Factory output', 'Restaurant sales', 'Unpaid household work', 'Software exports'],
        correct_index: 2,
        explanation: 'Unpaid work, inequality, and environmental costs are invisible to GDP.',
      },
    ],
  },
  {
    id: 'q12',
    lesson_id: 'l12',
    concept_id: 'c12',
    xp_reward: 30,
    pass_threshold: 70,
    questions: [
      {
        question: 'Can a profitable company run out of cash?',
        options: [
          'No, profit means cash',
          'Yes — profits may be owed but not yet collected',
          'Only if it commits fraud',
          'Only during recessions',
        ],
        correct_index: 1,
        explanation: 'Accounting profit books revenue before cash arrives — companies die from cash gaps.',
      },
      {
        question: 'What are the three sections of a cash flow statement?',
        options: [
          'Revenue, costs, profit',
          'Operating, investing, financing',
          'Assets, liabilities, equity',
          'Income, savings, spending',
        ],
        correct_index: 1,
        explanation: 'Cash flows are grouped by core operations, investments, and financing activities.',
      },
      {
        question: 'How is free cash flow calculated?',
        options: [
          'Revenue minus expenses',
          'Operating cash flow minus capital expenditures',
          'Net income plus dividends',
          'Total cash divided by debt',
        ],
        correct_index: 1,
        explanation: 'FCF = operating cash \u2212 CapEx — the money genuinely available to owners.',
      },
    ],
  },
];

export interface MockSimulationChoice {
  text: string;
  outcome: 'risky' | 'strategic' | 'balanced';
  feedback: string;
}

export interface MockSimulation {
  id: string;
  title: string;
  concept_id: string;
  xp_reward: number;
  scenario: string;
  choices: MockSimulationChoice[];
  learner_distribution: number[]; // percentage who chose each
}

export const MOCK_SIMULATIONS: MockSimulation[] = [
  {
    id: 's1',
    title: 'The Coffee Shop Dilemma',
    concept_id: 'c1',
    xp_reward: 20,
    scenario:
      'You own a coffee shop. A new competitor opens across the street with lower prices. Your sales drop 30% in one week. What do you do?',
    choices: [
      {
        text: 'Match their prices immediately',
        outcome: 'risky',
        feedback: 'Matching prices protects volume but crushes margins. You might not cover rent.',
      },
      {
        text: 'Differentiate — invest in premium quality and ambiance',
        outcome: 'strategic',
        feedback: 'Great choice. Premium positioning avoids a price war and builds loyalty.',
      },
      {
        text: 'Run a temporary promotion while studying their weaknesses',
        outcome: 'balanced',
        feedback: 'Smart. Short-term promotions buy time while you gather intelligence.',
      },
    ],
    learner_distribution: [25, 45, 30],
  },
  {
    id: 's2',
    title: 'The Windfall',
    concept_id: 'c2',
    xp_reward: 20,
    scenario:
      'You receive a $10,000 bonus at age 25. Your friend says "enjoy it while you\u2019re young." Your parents say "save every penny." What do you do?',
    choices: [
      {
        text: 'Spend it all — you only live once',
        outcome: 'risky',
        feedback: 'Fun today, but that $10,000 invested at 7% would be about $150,000 at retirement.',
      },
      {
        text: 'Invest 80%, enjoy 20% guilt-free',
        outcome: 'strategic',
        feedback: 'Excellent. $8,000 compounds for decades while $2,000 keeps life fun and sustainable.',
      },
      {
        text: 'Put it all in a savings account for now',
        outcome: 'balanced',
        feedback: 'Safe, but inflation will quietly erode it. Cash is a holding pattern, not a plan.',
      },
    ],
    learner_distribution: [15, 55, 30],
  },
  {
    id: 's3',
    title: 'The Grocery Squeeze',
    concept_id: 'c3',
    xp_reward: 20,
    scenario:
      'Inflation hits 8%. Your salary rises 3%. Your grocery bill is up 15%. You have $5,000 sitting in a checking account. What\u2019s your move?',
    choices: [
      {
        text: 'Keep the cash — safety first in uncertain times',
        outcome: 'risky',
        feedback: 'At 8% inflation, your $5,000 loses $400 of purchasing power in a year. Safety has a cost.',
      },
      {
        text: 'Move most of it into diversified investments and I-bonds',
        outcome: 'strategic',
        feedback: 'Well played. Inflation-protected assets defend purchasing power while staying liquid enough.',
      },
      {
        text: 'Stock up on non-perishables ahead of price rises',
        outcome: 'balanced',
        feedback: 'Practical for essentials, but hoarding goods doesn\u2019t scale — your money still needs a home.',
      },
    ],
    learner_distribution: [30, 40, 30],
  },
  {
    id: 's4',
    title: 'The Hot Stock Tip',
    concept_id: 'c4',
    xp_reward: 20,
    scenario:
      'A friend raves about a stock trading at a P/E of 95, saying "it only goes up." The market average P/E is 18. Do you buy?',
    choices: [
      {
        text: 'Buy immediately — momentum is momentum',
        outcome: 'risky',
        feedback: 'A 95x P/E prices in years of flawless growth. Any stumble and the fall is steep.',
      },
      {
        text: 'Research whether growth justifies the premium first',
        outcome: 'strategic',
        feedback: 'Exactly right. Some high P/Es are earned — but only the numbers can tell you.',
      },
      {
        text: 'Buy a small position you can afford to lose',
        outcome: 'balanced',
        feedback: 'Position sizing limits damage, but "affordable losses" still deserve real analysis.',
      },
    ],
    learner_distribution: [20, 50, 30],
  },
  {
    id: 's5',
    title: 'The Volatile Open',
    concept_id: 'c5',
    xp_reward: 20,
    scenario:
      'A biotech stock you follow releases trial results overnight. Pre-market quotes swing wildly between $18 and $30. You want to buy 100 shares. How do you order?',
    choices: [
      {
        text: 'Market order at the open — get in before it runs',
        outcome: 'risky',
        feedback: 'In a volatile open you could fill at $30 when you expected $22. Market orders surrender price control.',
      },
      {
        text: 'Limit order at your researched fair value',
        outcome: 'strategic',
        feedback: 'Textbook execution. You control the price and skip the chaos — even if it means missing the trade.',
      },
      {
        text: 'Wait an hour for the price to settle, then decide',
        outcome: 'balanced',
        feedback: 'Patience helps — early volatility often fades. You trade certainty of entry for better information.',
      },
    ],
    learner_distribution: [25, 45, 30],
  },
  {
    id: 's6',
    title: 'The Concentrated Portfolio',
    concept_id: 'c6',
    xp_reward: 20,
    scenario:
      'Your employer\u2019s stock has tripled and now makes up 70% of your portfolio. You believe in the company. What do you do?',
    choices: [
      {
        text: 'Hold everything — winners keep winning',
        outcome: 'risky',
        feedback: 'Your salary AND savings now depend on one company. Enron employees believed too.',
      },
      {
        text: 'Trim to 10-15% and diversify the proceeds',
        outcome: 'strategic',
        feedback: 'Disciplined. You lock in gains and decouple your wealth from a single point of failure.',
      },
      {
        text: 'Stop buying more but keep existing shares',
        outcome: 'balanced',
        feedback: 'Halting new exposure helps, but 70% concentration still leaves you dangerously exposed.',
      },
    ],
    learner_distribution: [20, 45, 35],
  },
  {
    id: 's7',
    title: 'The Rate Hike',
    concept_id: 'c7',
    xp_reward: 20,
    scenario:
      'The central bank signals aggressive rate hikes ahead. You hold mostly high-growth tech stocks and plan to buy a house next year. What\u2019s your priority?',
    choices: [
      {
        text: 'Do nothing — rates don\u2019t affect long-term investors',
        outcome: 'risky',
        feedback: 'Rates hit growth stocks and mortgage costs directly. Ignoring both could cost you twice.',
      },
      {
        text: 'Rebalance toward value stocks and lock a mortgage rate early',
        outcome: 'strategic',
        feedback: 'Sharp. You reduce rate-sensitive exposure and cap your borrowing cost before hikes land.',
      },
      {
        text: 'Delay the house purchase and keep the portfolio unchanged',
        outcome: 'balanced',
        feedback: 'Reasonable — waiting avoids peak rates, though your growth-heavy portfolio stays exposed.',
      },
    ],
    learner_distribution: [15, 50, 35],
  },
  {
    id: 's8',
    title: 'The Acquisition Target',
    concept_id: 'c8',
    xp_reward: 20,
    scenario:
      'You\u2019re evaluating two companies. Company A has huge revenues but debt is double its assets. Company B grows slower but has more cash than debt. Which do you back?',
    choices: [
      {
        text: 'Company A — revenue growth conquers all',
        outcome: 'risky',
        feedback: 'Leverage magnifies both wins and losses. One bad quarter and debt service eats Company A alive.',
      },
      {
        text: 'Company B — the balance sheet is destiny',
        outcome: 'strategic',
        feedback: 'Wise. Strong balance sheets survive downturns and buy weakened competitors at the bottom.',
      },
      {
        text: 'Split between both to hedge your bet',
        outcome: 'balanced',
        feedback: 'Hedging works, but make sure you\u2019re diversifying by conviction — not avoiding the analysis.',
      },
    ],
    learner_distribution: [20, 55, 25],
  },
  {
    id: 's9',
    title: 'The 25% Drawdown',
    concept_id: 'c9',
    xp_reward: 20,
    scenario:
      'Markets have fallen 25% in three months. Headlines scream "worse to come." Your portfolio is down $20,000 and your stomach hurts. What do you do?',
    choices: [
      {
        text: 'Sell everything and wait for the bottom',
        outcome: 'risky',
        feedback: 'Selling locks in losses, and nobody rings a bell at the bottom. Most who sell miss the rebound.',
      },
      {
        text: 'Keep buying on schedule — bear markets are sales',
        outcome: 'strategic',
        feedback: 'Steel nerves. Historically, consistent buying through bear markets produced outstanding returns.',
      },
      {
        text: 'Pause new investments but hold what you own',
        outcome: 'balanced',
        feedback: 'Holding avoids the worst mistake, though pausing buys means missing the cheapest prices.',
      },
    ],
    learner_distribution: [15, 40, 45],
  },
  {
    id: 's10',
    title: 'The Fund Selection',
    concept_id: 'c10',
    xp_reward: 20,
    scenario:
      'You\u2019re choosing a retirement fund. Option A: a star manager\u2019s fund, up 40% last year, 1.2% fee. Option B: a boring index fund, 0.04% fee. Where does your money go?',
    choices: [
      {
        text: 'The star manager — results speak for themselves',
        outcome: 'risky',
        feedback: 'Last year\u2019s winner is rarely next year\u2019s. Hot streaks fade; the 1.2% fee never does.',
      },
      {
        text: 'The index fund — low cost wins long games',
        outcome: 'strategic',
        feedback: 'The evidence agrees. Over decades, the fee gap alone compounds into a small fortune.',
      },
      {
        text: '80% index, 20% star manager for upside',
        outcome: 'balanced',
        feedback: 'A defensible core-satellite play — as long as you accept the satellite will likely lag.',
      },
    ],
    learner_distribution: [20, 50, 30],
  },
  {
    id: 's11',
    title: 'The Recession Headline',
    concept_id: 'c11',
    xp_reward: 20,
    scenario:
      'GDP contracts for a second straight quarter — a technical recession. Meanwhile, unemployment is at record lows and companies keep hiring. How do you read it?',
    choices: [
      {
        text: 'Recession means crash — sell risk assets now',
        outcome: 'risky',
        feedback: 'Markets look forward; by the time GDP confirms a recession, prices often already reflect it.',
      },
      {
        text: 'Weigh multiple indicators — GDP alone is incomplete',
        outcome: 'strategic',
        feedback: 'Correct. Jobs, spending, and earnings paint the full picture. One metric never tells the story.',
      },
      {
        text: 'Wait for the next quarter\u2019s data before acting',
        outcome: 'balanced',
        feedback: 'Prudent, but GDP is backward-looking — next quarter\u2019s report describes an economy three months gone.',
      },
    ],
    learner_distribution: [20, 55, 25],
  },
  {
    id: 's12',
    title: 'The Startup Offer',
    concept_id: 'c12',
    xp_reward: 20,
    scenario:
      'A startup offers you a job. It reported its first "profitable" quarter, but you notice customers pay in 90 days while payroll is due every 2 weeks. Do you take the job?',
    choices: [
      {
        text: 'Yes — profitable means safe',
        outcome: 'risky',
        feedback: 'Paper profits don\u2019t make payroll. That 90-day collection gap is how profitable startups die.',
      },
      {
        text: 'Ask about their cash runway and burn rate first',
        outcome: 'strategic',
        feedback: 'Exactly the right question. Months of cash on hand matters more than the income statement.',
      },
      {
        text: 'Take it, but keep six months of personal savings',
        outcome: 'balanced',
        feedback: 'A sensible hedge for you — though it doesn\u2019t change the company\u2019s cash flow risk.',
      },
    ],
    learner_distribution: [15, 60, 25],
  },
];

export interface MockNewsArticle {
  id: string;
  title: string;
  summary: string;
  why_it_matters: string | null;
  published_at: string;
  concept_id: string;
  concept_title: string;
  xp_reward: number;
}

export const MOCK_NEWS: MockNewsArticle[] = [
  {
    id: 'n1',
    title: 'Fed Holds Rates Steady Amid Mixed Economic Signals',
    summary:
      'The Federal Reserve kept interest rates unchanged at its latest meeting, citing both strong employment data and persistent inflation concerns.',
    why_it_matters:
      'Interest rates affect everything from mortgage costs to stock valuations. Understanding Fed decisions helps you make better investment timing decisions.',
    published_at: '2026-07-02',
    concept_id: 'c7',
    concept_title: 'Interest Rates',
    xp_reward: 10,
  },
  {
    id: 'n2',
    title: 'Tesla Reports Record Q2 Deliveries',
    summary:
      'Tesla delivered 500,000 vehicles in Q2 2026, beating analyst expectations by 12%. The stock surged 8% in after-hours trading.',
    why_it_matters:
      'Delivery numbers drive earnings expectations. Beating estimates often moves stock prices — a core supply and demand dynamic.',
    published_at: '2026-07-01',
    concept_id: 'c1',
    concept_title: 'Supply and Demand',
    xp_reward: 10,
  },
  {
    id: 'n3',
    title: 'June Inflation Cools to 2.6%, Lowest in Two Years',
    summary:
      'Consumer prices rose just 2.6% year-over-year in June, down from 3.1% in May, as energy and food costs eased across the board.',
    why_it_matters:
      'Cooling inflation preserves your purchasing power and raises the odds of rate cuts — which historically boost both stocks and bonds.',
    published_at: '2026-07-01',
    concept_id: 'c3',
    concept_title: 'Inflation',
    xp_reward: 10,
  },
  {
    id: 'n4',
    title: 'S&P 500 Notches Third Straight Record Close',
    summary:
      'The benchmark index climbed 0.7% to a new all-time high, extending a rally that has added 18% since January amid strong corporate earnings.',
    why_it_matters:
      'Record highs often trigger both FOMO and fear. Understanding bull market dynamics helps you stay disciplined instead of emotional.',
    published_at: '2026-06-30',
    concept_id: 'c9',
    concept_title: 'Bull and Bear Markets',
    xp_reward: 10,
  },
  {
    id: 'n5',
    title: 'Retail Investors Pour Record $12B Into Index Funds',
    summary:
      'Passive fund inflows hit an all-time monthly record in June, as retail investors continued shifting away from actively managed funds.',
    why_it_matters:
      'The migration to low-cost index funds is reshaping markets. Knowing why passive investing wins helps you evaluate your own strategy.',
    published_at: '2026-06-29',
    concept_id: 'c10',
    concept_title: 'Index Funds',
    xp_reward: 10,
  },
  {
    id: 'n6',
    title: 'MegaCorp\u2019s Earnings Beat Masks a Shrinking Cash Pile',
    summary:
      'MegaCorp topped earnings estimates for the sixth straight quarter, but analysts flagged that operating cash flow fell 40% as receivables ballooned.',
    why_it_matters:
      'Earnings can be managed; cash is harder to fake. Reading cash flow statements protects you from headline-driven mistakes.',
    published_at: '2026-06-28',
    concept_id: 'c12',
    concept_title: 'Cash Flow',
    xp_reward: 10,
  },
];

export interface MockBadge {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  earned: boolean;
}

export const MOCK_BADGES: MockBadge[] = [
  { id: 'b1', name: 'First Lesson', slug: 'first-lesson', icon: '\ud83c\udfaf', description: 'Complete your first lesson', earned: true },
  { id: 'b2', name: 'Quiz Ace', slug: 'quiz-ace', icon: '\ud83e\udde0', description: 'Score 100% on a quiz', earned: false },
  { id: 'b3', name: 'Simulation Pro', slug: 'simulation-pro', icon: '\ud83c\udfae', description: 'Complete a simulation', earned: false },
  { id: 'b4', name: 'Week Warrior', slug: 'week-warrior', icon: '\ud83d\udd25', description: '7-day streak', earned: true },
  { id: 'b5', name: 'Knowledge Seeker', slug: 'knowledge-seeker', icon: '\ud83d\udcda', description: 'Complete 5 lessons', earned: false },
  { id: 'b6', name: 'Market Maven', slug: 'market-maven', icon: '\ud83d\udcc8', description: 'Master all market concepts', earned: false },
];

export interface MockLeagueUser {
  rank: number;
  name: string;
  weekly_xp: number;
  is_current_user: boolean;
}

export interface MockLeague {
  tier: string;
  week_start: string;
  week_end: string;
  users: MockLeagueUser[];
}

const LEAGUE_NAMES = [
  'Sarah K.', 'Mike R.', 'Alex', 'Jamie L.', 'Chris D.',
  'Taylor M.', 'Jordan P.', 'Casey B.', 'Morgan W.', 'Riley S.',
  'Quinn H.', 'Avery T.', 'Dakota F.', 'Reese N.', 'Skyler G.',
  'Parker J.', 'Emerson C.', 'Finley R.', 'Rowan D.', 'Sage M.',
  'Blake O.', 'Charlie V.', 'Drew A.', 'Elliot K.', 'Frankie L.',
  'Harper Z.', 'Indigo B.', 'Jules W.', 'Kendall Y.', 'Lennon Q.',
];

const LEAGUE_XP = [
  520, 480, 450, 390, 340,
  325, 310, 295, 280, 265,
  250, 240, 230, 215, 200,
  190, 180, 165, 150, 140,
  130, 115, 105, 95, 80,
  70, 55, 45, 30, 15,
];

export const MOCK_LEAGUE: MockLeague = {
  tier: 'Bronze',
  week_start: '2026-06-30',
  week_end: '2026-07-06',
  users: LEAGUE_NAMES.map((name, i) => ({
    rank: i + 1,
    name,
    weekly_xp: LEAGUE_XP[i],
    is_current_user: name === 'Alex',
  })),
};

export interface MockDailyChallenge {
  id: string;
  lesson_title: string;
  lesson_slug: string;
  xp_reward: number;
  completed: boolean;
}

export const MOCK_DAILY_CHALLENGE: MockDailyChallenge = {
  id: 'dc1',
  lesson_title: 'Inflation Basics',
  lesson_slug: 'inflation',
  xp_reward: 50,
  completed: false,
};

// 28-day activity history for the streak calendar (most recent day last = today).
// true = active day
export const MOCK_STREAK_HISTORY: boolean[] = [
  false, true, true, false, true, true, true,
  false, false, true, true, true, false, true,
  true, false, true, true, false, true, true,
  true, true, true, true, true, true, true,
];

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------

export function getConceptBySlug(slug: string): MockConcept | undefined {
  return MOCK_CONCEPTS.find((c) => c.slug === slug);
}

export function getConceptById(id: string): MockConcept | undefined {
  return MOCK_CONCEPTS.find((c) => c.id === id);
}

export function getLessonBySlug(slug: string): MockLesson | undefined {
  return MOCK_LESSONS.find((l) => l.slug === slug);
}

export function getLessonByConceptId(conceptId: string): MockLesson | undefined {
  return MOCK_LESSONS.find((l) => l.concept_id === conceptId);
}

export function getQuizById(id: string): MockQuiz | undefined {
  return MOCK_QUIZZES.find((q) => q.id === id);
}

export function getQuizByConceptId(conceptId: string): MockQuiz | undefined {
  return MOCK_QUIZZES.find((q) => q.concept_id === conceptId);
}

export function getSimulationById(id: string): MockSimulation | undefined {
  return MOCK_SIMULATIONS.find((s) => s.id === id);
}

export function getSimulationByConceptId(conceptId: string): MockSimulation | undefined {
  return MOCK_SIMULATIONS.find((s) => s.concept_id === conceptId);
}
