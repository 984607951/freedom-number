/* =========================================================
   财富自由计算器 · Freedom Number
   Formula source: 「小Lin说」《你需要多少钱，才能财富自由？》
   临界值 = 12/(名义收益率 − 通胀率) × 月开销 + K×N + M + H
   ========================================================= */

/* ---------------- i18n ---------------- */
const I18N = {
  zh: {
    brand: '财富自由计算器', brandSub: 'Freedom Number',
    eyebrow: '灵感来自「小Lin说」财富自由公式',
    heroLine1: '你到底需要多少钱', heroLine2: '才能财富自由？',
    heroLead: '有人说 500 万就够，有人张口就是一个亿。但那都是别人的数。这里有一条公式，把你自己的活法折算成一个数字。',
    formulaLabel: '财富自由临界值', formulaBody: '480 × 月开销 + 育儿 + 健康 + 重大投入',
    multCap: '终身乘数', ctaStart: '开始算出我的数字', ctaWhy: '每一项是怎么来的',
    heroNote: '这不是一个「猜数字」的游戏。它假设：你不工作了，生活水平不降，资产一分不少，购买力永远不缩水。',

    calcTitle: '四步，填完就看到答案',
    calcSub: '每个格子下面都写清楚了该填什么、为什么填。不确定就先用默认值，随时能改。',

    s1Title: '你每个月想花多少钱',
    s1Sub: '这是公式里最关键的变量 X —— 它决定你 80% 的数字。',
    fMonthly: '月开销', perMonth: '元/月',
    fMonthlyHint: '吃饭、穿衣、交通、房租或房贷、看病、娱乐、旅行、水电网——都算进去。注意：不包含买房和养孩子，那两项在第 2 步单独填。',
    moreMonthly1: '这一步真正在问的，不是「你能省多少」，而是「你愿意用什么样的生活水平，换一个多大的数字」。月开销每加 1000 元，你的自由门槛就抬高约 48 万。',
    moreMonthly2: '参考：2025 年全国人均消费支出 2456 元/月；城镇居民人均 2990 元/月；夫妻两人直接乘 2。',

    s2Title: '人生里的几笔大钱',
    s2Sub: '这些是一次性的、不靠利息滚动的钱，要直接加到本金里。',
    fKids: '你想生几个孩子', fChildCost: '养一个孩子总共要花', perWan: '万元', perWanPlain: '万',
    fChildHint: '从怀孕养到 18 岁。全国平均 58 万；北京约 100 万，上海约 108 万，贵州约 43 万。想给孩子更好的，就往高了填。',
    moreChild1: '《中国生育成本报告》统计：2024 年全国平均每个孩子每月花 2543.84 元，从备孕养到 18 岁累计约 58 万元。这个数和各地人均 GDP 高度相关——上海 108 万、北京 100 万、贵州 43 万。中国养孩子的成本相对人均 GDP，全球第二高，仅次于韩国。',
    moreChild2: '备注：孩子越多，单个平均成本会略降（大约每多一个降 15%），本计算器为简化未计入。',
    fHealth: '给自己留一笔看病钱',
    fHealthHint: '这一辈子万一得大病的备用金。二线城市 15–30 万，一线城市 30–60 万。这笔钱不投资、不生利息，就是放着备用。',
    moreHealth1: '这一项最没谱，也最容易被低估。按 2025 年统计估算，全国人均一生的卫生支出约 20 万元；分城市看，二线 15–30 万，一线 30–60 万。它是一项「封存」的钱——不投资、不生息，就静静放在那里等你可能需要它的那天。',
    fHouse: '买房要花',
    fHouseHint: '按你想买的那套房现在的市价填。已经有房就填 0；打算租一辈子，就把月租加到第 1 步的月开销里。',
    moreHouse1: '按你理想那套房现在的市价，直接加上去——不用考虑通胀和投资收益，因为它是一笔立刻要花掉的钱。有地方住，这项就是 0；决定长期租房，就把它换成月租金，塞进第一步的 X 里。',

    s3Title: '钱能生多少钱',
    s3Sub: '整个公式的地基。真实收益率每降 0.5%，你的数字就要多出一大截。',
    fNominal: '每年大概能赚多少（年化收益率）',
    fNominalHint: '银行一年定期只有 0.95%。如果交给专业机构做长期配置，扣掉各种费用后，普通人大概能做到 4%~4.5%。拿不准就用 4.5%。',
    moreNominal1: '存款跑不赢通胀——一年期 0.95%、五年期 1.3%，核心通胀约 1.0%，你只是勉强站在水面上。想有正的真实收益，就得持有股票和债券。国内专业机构的长期成绩：社保基金 2000–2024 年平均 7.39%，企业年金 2007–2024 年平均 6.17%。但这是基金经理的收益率，扣掉显性隐性的手续费、管理费，到普通投资者手上大约要再少 2–3 个百分点。',
    moreNominal2: '所以视频给出的假设是：普通人做合理长期配置，名义回报 4%~4.5%。这也是本计算器的默认值。',
    fInflation: '物价每年涨多少（通胀率）',
    fInflationHint: '长期平均按 2% 算。因为你要花的是几十年后的钱，今天的 1 万，二十年后买不到今天这么多东西。',
    moreInflation1: '算一两年可以忽略通胀，但你要算的是未来七八十年的开销，它必须算进去。因为你要保证的不是「每月有 1 万块」，而是「每月有今天这 1 万块的购买力」。',

    rrReal: '真实收益率', rrMult: '终身乘数',
    rrNote: '收益率减去物价，就是真实收益。乘数 = 12 个月 ÷ 真实收益率。',

    resLabel: '你的财富自由数字', resLive: '实时更新', ringCap: '已达成',
    resHave: '你现在的可投资资产', resBreak: '这笔钱是怎么算出来的',
    bkCore: '日常开销 × 乘数', bkKids: '养孩子', bkHealth: '看病备用金', bkHouse: '买房',
    mintBtn: '生成我的徽章', mintShort: '生成徽章',
    resultNote: '这只是个估算。收益率和物价都是假设，人生也没有标准答案——它的用处，是帮你看清自己的选择。',

    expTitle: '这条公式，每一项在说什么',
    expSub: '不用懂金融。只要理解这三个问题，你就知道自己该填什么。',
    exp1T: '为什么是 480 倍？',
    exp1B: '假设你的钱每年能跑出 2.5% 的真实收益（4.5% 回报减去 2% 物价）。要覆盖一年 12 个月的开销，就需要 12 ÷ 2.5% = 480 个月的。这就是那个乘数：今天的 480 块，等于往后每个月多出的 1 块钱。',
    exp2T: '为什么不能只存定期？',
    exp2B: '一年定期只有 0.95%，五年 1.3%，而物价每年涨约 1%。你站在水面上，浪一来就往下沉。存款跑不赢物价，中国、美国、日本、欧洲都一样。所以这个公式有个硬前提：钱必须做长期、合理的投资。',
    exp3T: '孩子、生病、房子，为什么要单算？',
    exp3B: '这三笔是「封存」的钱——不投资、不生利息，只是提前摆在一边。而养老其实已经藏在月开销里了：你按今天的开销花到老，高龄多出来的护理费，被「老了花得少」大致抵消。所以公式里没有单独的养老项。',
    exp4T: '它其实是一次人生规划',
    exp4B: '算这个数字的价值不在结果，而在过程：你被迫回答「我每月想花多少、要不要孩子、想住在哪、这辈子到底要什么」。算完你会发现，让数字变小的杠杆，往往不是收益率，而是欲望的形状。',
    quote: '“千万别高估了财富自由之后的快乐，也千万别忽略了眼前的美好。”',
    quoteBy: '—— 「小Lin说」',

    footNote: '本工具为开源计算模型，公式与数据参考「小Lin说」视频《你需要多少钱，才能财富自由？》。所有收益率、通胀、成本均为假设值，不构成任何投资建议。',
    footMade: 'Made for people who want to see their own number.',

    tabBadge: '我的徽章', tabPlan: '要存多少年',
    saveImg: '保存图片', shareNow: '分享',
    badgeTip: '保存图片后，你可以发到任何地方。徽章编号由你的数字生成，独一无二。',
    planTitle: '从今天开始存，要存多少年',
    planSub: '假设你把每年攒下的钱都拿去投资，收益率和上面一样。',
    piSave: '每月能存下', piGrowth: '每年多存一点（涨幅）',
    lgAsset: '你的钱', lgTarget: '要够到的线',
    planNote: '前十几年几乎看不出变化，后面会突然变陡。所以「开始得早」，比「收益率高一点」管用得多。',

    unitWan: '万', unitYi: '亿',
    chips: ['¥3k 小城极简', '¥6k 二线城市', '¥1万 城市舒适', '¥1.5万 一线体面', '¥2.5万 品质生活'],
    gapNeed: '还差 {x}', gapDone: '你已经越线了',
    insDone: '按这套假设，你已经越过了自己的自由线——从今天起，每月花 {x} 也不会伤到本金。',
    insCore: '日常开销占了你门槛的 {p}%。控制 X 是这个公式里最有效的杠杆：月开销每降 1000 元，门槛就少 48 万。',
    insHouse: '房子占了你门槛的 {p}%——它是唯一一项不产生收益的钱，也是最能被重新定义的一项。',
    insGap: '你距离自由还差 {g}。按每月存 {s} 起算，打开「储蓄计划」能看到具体要多少年。',
    insInvalid: '真实收益率必须大于 0。把名义收益率调高，或把通胀率调低，这个公式才有意义。',
    badgeLine: '{n}，这是你的数字。徽章编号由它生成，独一无二。',
    serialCap: '编号', dateCap: '签发', amountCap: '财富自由',
    kpiYears: '达成年限', kpiInvest: '累计投入', kpiGain: '投资收益',
    kpiNeed30: '每月需存 · 30年', kpiInvest60: '60年累计投入', kpiEnd60: '60年后资产',
    yearUnit: '年', never: '60 年内未达成',
    toastSaved: '图片已保存', toastCopied: '已复制到剪贴板', toastFail: '保存失败，请长按图片保存',
    shareText: '我的财富自由数字是 {x}。你的呢？',
    srcCap: '数据来源',
    srcList: '国家统计局 2025 · 《中国生育成本报告》2024 · 全国社保基金理事会 · 企业年金 2007–2024',
    ranks: ['轻装', '起步', '城市', '从容', '一线', '星耀'],
    etaLabel: '预计 {y} 年后达成',

    kCalc: '计算器', kFormula: '公式', kGuide: '计算手册', kFaq: '常见问题',
    ctaGuide: '先看怎么填',
    bubble1: '我也算过', bubble2: '真的没那么吓人',
    hs1: '终身乘数', hs2: '假设真实收益率', hs3: '步填完就有答案',
    rcSub: '存到这么多，你就再也不用为钱工作了',
    kids0: '不要', kids1: '1 个', kids2: '2 个', kids3: '3 个',
    sceneT: '房子、孩子、父母、身体',
    sceneB: '你背着的不是负债，是你在乎的东西。所以这个数字大，不丢人——它只是把你本来就在承担的东西，第一次算清楚了。',
    formulaTitle: '480 这个数，是怎么来的',
    formulaSub: '不用懂金融。看懂这一条，你就知道为什么月开销 1 万，需要 480 万。',
    fbK1: '需要的钱', fbK2: '每月开销', fbK3: '养孩子', fbK4: '看病钱', fbK5: '买房',
    fbNote: '唯一要动脑的地方，就是这个 480。',
    guideTitle: '照着这四步填，不会错',
    guideSub: '不知道某个格子该填什么，就回来看看这一页。',
    guide: [
      ['先算出「每个月花多少」', '把最近三个月的生活费加起来，除以 3，就是你的真实月开销。不用精确到个位，大概齐就行。']
      , ['孩子、看病、买房，单独填', '这三笔是一次性的大钱，不靠利息滚，所以直接加在总数上。有就填，没有就填 0。']
      , ['收益率拿不准，就填 4.5%', '这个数不是你能决定的，是市场决定的。填低一点，算出来的数字更大（更保险）；填高一点，数字更小（更冒险）。']
      , ['多改几次，看看自己在乎什么', '每改一个数，右边立刻跟着变。试上十次，你会发现自己真正舍不得的是哪一项。']
    ],
    faqTitle: '算出来数字太大，怎么办',
    faqSub: '下面这几条，是大家算完最爱问的。',
    faq: [
      ['算出来一千多万，是不是这辈子没戏了？', '不是。这个数字按「完全不工作、本金一分不动、购买力永不下降」算，是最严苛的版本。真实生活里，你有工资、有社保、房子可能升值，退休后开销也会降。']
      , ['为什么月开销 1 万，就要 480 万？', '因为你要靠利息生活。480 万按 2.5% 的真实收益，一年正好生出 12 万，也就是每月 1 万，而本金一分没动。这就是「永远花不完」。']
      , ['我有房子，还要填买房钱吗？', '不用，那一格填 0。但物业费、维修费、房产税要算进每月的开销里。']
      , ['4.5% 的收益率靠谱吗？', '这是「扣掉物价上涨之后」的长期假设，参考了社保基金等机构的真实成绩——普通人扣掉各种费用后大约 4%~4.5%。它不保证每年都这样，但用来做长期规划，是目前最合理的假设。']
      , ['这个数字以后会变吗？', '会。换城市、换工作、要不要孩子、父母身体——任何一项变了，数字就变。所以它是一个体检指标，不是一句判决。']
    ],
    fKidsHint: '不确定就先选「不要」，数字会小一些；想看养娃的代价，选 1 个试试。',

  },

  en: {
    brand: 'Freedom Number', brandSub: 'Wealth Calculator',
    eyebrow: 'Inspired by the "小Lin说" wealth formula',
    heroLine1: 'How much money', heroLine2: 'do you actually need?',
    heroLead: 'Some say ¥5M is enough. Others say ¥100M. But those are someone else\'s numbers. Here is one formula that turns your own way of living into a single figure.',
    formulaLabel: 'Your freedom threshold', formulaBody: '480 × monthly spend + kids + health + big buys',
    multCap: 'lifetime multiplier', ctaStart: 'Find my number', ctaWhy: 'Where each part comes from',
    heroNote: 'This is not a guessing game. It assumes you stop working, keep your lifestyle, never touch the principal, and never lose purchasing power.',

    calcTitle: 'Four steps. You cannot get it wrong',
    calcSub: 'Every box tells you what to put in and why. If unsure, keep the default — you can change it any time.',

    s1Title: 'What does a month cost you?',
    s1Sub: 'This is X — the single most important variable. It drives about 80% of your result.',
    fMonthly: 'Monthly spending', perMonth: '/mo',
    fMonthlyHint: 'Food, clothes, transport, rent or mortgage, health, fun, travel, utilities — all of it. Not included: a home and children, which go in step 2.',
    moreMonthly1: 'The real question here is not "how much can I cut", but "what standard of living am I willing to trade for which number". Every ¥1,000 more per month adds roughly ¥480,000 to your threshold.',
    moreMonthly2: 'Reference: 2025 China average consumption is ¥2,456/month per person; ¥2,990 for urban residents. A couple simply doubles it.',

    s2Title: 'The few really big sums',
    s2Sub: 'These are locked-up sums that earn nothing. They stack straight on top of the principal.',
    fKids: 'How many children?', fChildCost: 'Total cost per child', perWan: '×10k', perWanPlain: '×10k',
    fChildHint: 'From pregnancy to age 18. National average ¥580K; Beijing ~¥1M, Shanghai ~¥1.08M, Guizhou ~¥430K. Want more for your child? Fill in higher.',
    moreChild1: 'Per China\'s Fertility Cost Report: in 2024 a child costs ¥2,543.84/month on average, or about ¥580K from pregnancy to 18. It tracks regional GDP closely — Shanghai ¥1.08M, Beijing ¥1M, Guizhou ¥430K. Relative to GDP per capita, raising a child in China is the second most expensive in the world, after South Korea.',
    moreChild2: 'Note: marginal cost drops slightly with more children (~15% per extra child). Skipped here for simplicity.',
    fHealth: 'Money set aside for illness',
    fHealthHint: 'A reserve in case of serious illness. ¥150–300K in tier-2 cities, ¥300–600K in tier-1. This money is not invested and earns nothing — it just sits there.',
    moreHealth1: 'The vaguest item, and the most easily underestimated. 2025 estimates put lifetime health spending at about ¥200K per person nationally; by city, ¥150–300K in tier-2 and ¥300–600K in tier-1. This money is sealed — not invested, not compounding, just waiting for the day you might need it.',
    fHouse: 'Cost of a home',
    fHouseHint: 'Use today\'s price for the home you actually want. Already own one? Put 0. Renting forever? Add the rent to your monthly spending in step 1.',
    moreHouse1: 'Take the current market price of the home you actually want and add it directly — no inflation, no investment return, because this money gets spent, not grown. If you have a place to live, this is 0. If you plan to rent forever, convert it to monthly rent and fold it into X.',

    s3Title: 'What your money can earn',
    s3Sub: 'The foundation of the whole formula. Every 0.5% off your real return adds a large chunk to your number.',
    fNominal: 'What your money earns per year',
    fNominalHint: 'A one-year bank deposit pays 0.95%. With a sensible long-term portfolio, an ordinary investor gets roughly 4–4.5% after all fees. Not sure? Use 4.5%.',
    moreNominal1: 'Deposits lose to inflation — 0.95% for one year, 1.3% for five, against core inflation near 1.0%. You are barely treading water. Positive real returns require equities and bonds. Domestic professionals did well: the social security fund averaged 7.39% from 2000–2024, corporate annuities 6.17% from 2007–2024. But those are fund managers\' returns — after explicit and hidden fees, retail investors typically give up another 2–3 points.',
    moreNominal2: 'Hence the video\'s assumption: a sensible long-term allocation yields 4–4.5% nominal. That is the default here.',
    fInflation: 'How fast prices rise',
    fInflationHint: '2% is the long-run average. You are spending money decades from now, and ¥10,000 today will not buy the same things in twenty years.',
    moreInflation1: 'Ignore inflation over one or two years and you are fine. But you are planning spending over 70–80 years, so it has to be in the math. What you need to guarantee is not "¥10,000 a month", but "¥10,000 a month in today\'s purchasing power".',

    rrReal: 'Real return', rrMult: 'Multiplier',
    rrNote: 'Return minus inflation is your real return. Multiplier = 12 months ÷ real return.',

    resLabel: 'Your freedom number', resLive: 'live', ringCap: 'reached',
    resHave: 'Your investable assets today', resBreak: 'How this number is built',
    bkCore: 'Living costs × multiplier', bkKids: 'Children', bkHealth: 'Health reserve', bkHouse: 'A home',
    mintBtn: 'Create my badge', mintShort: 'Get badge',
    resultNote: 'Just an estimate. Returns and inflation are assumptions, and life has no answer key. Its job is to make your choices visible.',

    expTitle: 'What each part is really saying',
    expSub: 'No finance degree needed. Understand these three ideas and you will know what to enter.',
    exp1T: 'Why 480×?',
    exp1B: 'Assume your money earns 2.5% above inflation (4.5% return minus 2% prices). To cover 12 months of spending you need 12 ÷ 2.5% = 480 months\' worth. That is the multiplier: ¥480 today becomes ¥1 more every month, for life.',
    exp2T: 'Why not just a deposit?',
    exp2B: 'A one-year deposit pays 0.95%, five-year 1.3%, while prices rise about 1% a year. You are standing at the waterline and every wave pulls you under. Deposits losing to inflation is true in China, the US, Japan and Europe. So the formula has a hard precondition: invest long-term and sensibly.',
    exp3T: 'Why are children, illness and a home separate?',
    exp3B: 'These three are sealed money — not invested, earning nothing, just set aside. Retirement, by contrast, is already inside monthly spending: you spend at today\'s level forever, and higher care costs late in life are roughly offset by spending less when old. That is why there is no separate retirement line.',
    exp4T: 'It is really a life plan',
    exp4B: 'The value is not the number but the process: you are forced to answer how much you want to spend, whether you want children, where you want to live, what you actually want. The biggest lever is usually not the return — it is the shape of your desires.',
    quote: '“Never overestimate the joy after financial freedom, and never overlook the beauty right in front of you.”',
    quoteBy: '— 小Lin说',

    footNote: 'An open calculation model. Formula and data reference the video "How much money do you need to be financially free?" by 小Lin说. All returns, inflation and costs are assumptions, not investment advice.',
    footMade: 'Made for people who want to see their own number.',

    tabBadge: 'My badge', tabPlan: 'How many years',
    saveImg: 'Save image', shareNow: 'Share',
    badgeTip: 'Save the image and post it anywhere. Your serial number is generated from your own figures.',
    planTitle: 'From today, how long will it take',
    planSub: 'Assuming you invest what you save each year, at the same return as above.',
    piSave: 'You can save each month', piGrowth: 'Saving grows each year',
    lgAsset: 'Your money', lgTarget: 'The line to reach',
    planNote: 'Nothing seems to happen for a decade, then it turns sharply upward. That is why starting early beats earning slightly more.',

    unitWan: '×10k', unitYi: '×100M',
    chips: ['¥3k minimal', '¥6k tier-2', '¥10k comfortable', '¥15k tier-1', '¥25k premium'],
    gapNeed: '{x} to go', gapDone: 'You are past the line',
    insDone: 'Under these assumptions you have already crossed your line — spending {x} a month no longer touches the principal.',
    insCore: 'Living costs are {p}% of your threshold. Controlling X is the most powerful lever here: ¥1,000 less per month removes ¥480K.',
    insHouse: 'The home is {p}% of your threshold — the only sum that earns nothing, and the most redefinable one.',
    insGap: 'You are {g} away. Saving {s} a month, open the savings plan to see how many years it takes.',
    insInvalid: 'Real return must be above zero. Raise the nominal return or lower inflation — otherwise the formula breaks down.',
    badgeLine: '{n} — this is your number. The serial is derived from it, and it is yours alone.',
    serialCap: 'Serial', dateCap: 'Issued', amountCap: 'FINANCIAL FREEDOM',
    kpiYears: 'Years to go', kpiInvest: 'Total saved', kpiGain: 'Investment gain',
    kpiNeed30: 'Save / mo · 30y', kpiInvest60: 'Invested · 60y', kpiEnd60: 'Assets · 60y',
    yearUnit: 'yrs', never: 'Not within 60 years',
    toastSaved: 'Image saved', toastCopied: 'Copied to clipboard', toastFail: 'Save failed, long-press the image',
    shareText: 'My freedom number is {x}. What is yours?',
    srcCap: 'Data',
    srcList: 'China NBS 2025 · Fertility Cost Report 2024 · National Social Security Fund · Corporate annuities 2007–2024',
    ranks: ['Feather', 'Starter', 'Urban', 'Composed', 'Metropolis', 'Stellar'],
    etaLabel: 'Reached in {y} years',

    kCalc: 'Calculator', kFormula: 'The formula', kGuide: 'How to fill it in', kFaq: 'Questions',
    ctaGuide: 'How do I fill it in?',
    bubble1: 'I did this too', bubble2: 'It is not that scary',
    hs1: 'lifetime multiplier', hs2: 'assumed real return', hs3: 'steps to your answer',
    rcSub: 'Once you have this much, you never have to work for money again',
    kids0: 'None', kids1: '1', kids2: '2', kids3: '3',
    sceneT: 'A home, kids, parents, your health',
    sceneB: 'What you carry is not debt — it is what you care about. So a big number is not shameful. It is simply the first honest tally of what you were already carrying.',
    formulaTitle: 'Where does 480 come from?',
    formulaSub: 'No finance knowledge needed. Understand this one line and you will see why ¥10,000 a month needs ¥4.8M.',
    fbK1: 'Money you need', fbK2: 'Monthly spending', fbK3: 'Children', fbK4: 'Health', fbK5: 'A home',
    fbNote: 'The only part that needs thinking is this 480.',
    guideTitle: 'Four steps. You cannot get it wrong',
    guideSub: 'If you forget what a box means, come back to this page.',
    guide: [
      ['Work out what a month costs you', 'Add up your last three months of living costs, then divide by three. That is your real monthly number. You do not need it to the yuan — roughly right is fine.']
      , ['Children, health and a home go in separately', 'These three are one-off sums that do not earn interest, so they are added straight on top. Fill them in if they apply, otherwise put 0.']
      , ['Unsure about the return? Use 4.5%', 'You do not control this — the market does. A lower number makes your target bigger (safer); a higher one makes it smaller (riskier).']
      , ['Change it a few times and see what you care about', 'Every change updates the answer instantly. After ten tries you will notice which line you are least willing to cut.']
    ],
    faqTitle: 'The number came out huge. Now what?',
    faqSub: 'These are the questions people ask most after calculating.',
    faq: [
      ['It says over ten million. Is it hopeless?', 'No. That figure assumes you never work again, never touch the principal, and never lose purchasing power — the strictest possible version. Real life includes a salary, social insurance, a home that may appreciate, and lower spending after retirement.']
      , ['Why does ¥10,000 a month need ¥4.8M?', 'Because you live off the return. At a 2.5% real return, ¥4.8M generates ¥120,000 a year — exactly ¥10,000 a month — without the principal shrinking by a single yuan. That is what "never runs out" means.']
      , ['I already own a home. Do I still add one?', 'No, put 0 there. But property fees, maintenance and taxes belong in your monthly spending.']
      , ['Is a 4.5% return realistic?', 'It is a long-run assumption after inflation, based on what institutions like the social security fund have actually earned — around 4–4.5% for an ordinary investor after fees. It will not hold every year, but for long-term planning it is the most reasonable assumption available.']
      , ['Will this number change later?', 'Yes. Move city, change job, have a child, a parent gets ill — any of these moves the number. Treat it as a health check, not a verdict.']
    ],
    fKidsHint: 'Unsure? Start with none and watch the number drop. Want to see the real cost of a child? Pick one.',

  },

  ko: {
    brand: '재무 자유 계산기', brandSub: 'Freedom Number',
    eyebrow: '「小Lin说」재무 자유 공식에서 착안',
    heroLine1: '당신에게 필요한 돈은', heroLine2: '얼마일까요?',
    heroLead: '누군가는 500만 위안이면 충분하다 하고, 누군가는 1억 위안이라고 합니다. 하지만 그건 남의 숫자죠. 여기, 당신의 삶을 하나의 숫자로 바꾸는 공식이 있습니다.',
    formulaLabel: '재무 자유 임계값', formulaBody: '480 × 월 지출 + 자녀 + 건강 + 큰 지출',
    multCap: '평생 승수', ctaStart: '내 숫자 계산하기', ctaWhy: '각 항목의 근거',
    heroNote: '숫자 맞히기 게임이 아닙니다. 일하지 않아도 생활 수준이 유지되고, 원금이 줄지 않고, 구매력이 떨어지지 않는다고 가정합니다.',

    calcTitle: '네 단계면 충분합니다',
    calcSub: '각 칸에 무엇을 왜 넣는지 다 적혀 있습니다. 모르면 기본값으로 두고 나중에 바꾸세요.',

    s1Title: '한 달에 얼마를 쓰나요',
    s1Sub: '공식에서 가장 중요한 변수 X 입니다. 결과의 약 80%를 결정합니다.',
    fMonthly: '월 지출', perMonth: '위안/월',
    fMonthlyHint: '식비, 의복, 교통, 월세나 대출, 의료, 여가, 여행, 공과금을 모두 포함하세요. 주택 구입과 자녀 비용은 제외하며 2단계에서 따로 넣습니다.',
    moreMonthly1: '이 단계의 진짜 질문은 "얼마나 아낄 수 있나"가 아니라 "어떤 생활 수준을 얼마의 숫자와 맞바꿀 것인가"입니다. 월 지출이 1,000위안 늘면 임계값은 약 48만 위안 올라갑니다.',
    moreMonthly2: '참고: 2025년 중국 1인당 소비지출 월 2,456위안, 도시 거주자는 2,990위안. 부부는 2배로 계산합니다.',

    s2Title: '인생의 큰 지출 몇 가지',
    s2Sub: '이자로 불어나지 않는 돈입니다. 원금에 그대로 더해야 합니다.',
    fKids: '자녀는 몇 명인가요', fChildCost: '자녀 1인 총 비용', perWan: '만 위안', perWanPlain: '만',
    fChildHint: '임신부터 18세까지. 전국 평균 58만 위안, 베이징 약 100만, 상하이 약 108만, 구이저우 약 43만 위안입니다.',
    moreChild1: '《중국 출산비용 보고서》에 따르면 2024년 전국 평균 자녀 1인당 월 2,543.84위안, 18세까지 약 58만 위안입니다. 지역 1인당 GDP와 밀접하게 연동됩니다 — 상하이 108만, 베이징 100만, 구이저우 43만. 1인당 GDP 대비 양육비는 전 세계 2위로 한국에 이어 두 번째입니다.',
    moreChild2: '참고: 자녀가 늘수록 1인당 평균 비용은 약 15% 낮아지지만, 계산을 단순화하기 위해 반영하지 않았습니다.',
    fHealth: '질병 대비 자금',
    fHealthHint: '큰 병에 대비한 예비금입니다. 2선 도시 15~30만, 1선 도시 30~60만 위안. 투자하지 않고 이자도 붙지 않는, 그냥 묻어두는 돈입니다.',
    moreHealth1: '가장 불확실하고 가장 과소평가되는 항목입니다. 2025년 통계 기준 1인당 평생 의료비는 약 20만 위안, 도시별로 2선 15–30만, 1선 30–60만 위안입니다. 투자하지 않고 이자도 붙지 않는, 말 그대로 봉인된 돈입니다.',
    fHouse: '주택 구입비',
    fHouseHint: '원하는 집의 현재 시세를 넣으세요. 이미 집이 있으면 0, 평생 임대할 생각이면 월세를 1단계 월 지출에 더하세요.',
    moreHouse1: '원하는 집의 현재 시장가를 그대로 더하세요. 물가상승률이나 투자수익률은 고려하지 않습니다 — 바로 써야 하는 돈이기 때문입니다. 살 곳이 있으면 0, 계속 임대할 생각이면 월세로 바꿔 1단계 X에 넣으세요.',

    s3Title: '돈이 얼마를 벌어주나요',
    s3Sub: '공식 전체의 토대입니다. 실질 수익률이 0.5% 떨어질 때마다 숫자는 크게 올라갑니다.',
    fNominal: '연간 수익률',
    fNominalHint: '1년 정기예금은 0.95%입니다. 장기 분산 투자를 하면 각종 비용을 빼고도 평균 4~4.5% 정도가 가능합니다. 모르면 4.5%를 쓰세요.',
    moreNominal1: '예금은 물가를 못 이깁니다 — 1년 0.95%, 5년 1.3%, 핵심 물가상승률은 약 1.0%. 간신히 물 위에 떠 있는 정도죠. 실질 수익을 얻으려면 주식과 채권이 필요합니다. 중국 국내 전문기관의 장기 성적은 사회보장기금 2000–2024년 평균 7.39%, 기업연금 2007–2024년 평균 6.17%입니다. 다만 이는 펀드매니저의 수익률이고, 각종 수수료와 운용보수를 빼면 개인 투자자에게는 2~3%포인트가 더 줄어듭니다.',
    moreNominal2: '그래서 영상의 가정은 이렇습니다: 평범한 사람이 합리적으로 장기 자산배분을 하면 명목 4~4.5%. 이 계산기의 기본값입니다.',
    fInflation: '물가 상승률',
    fInflationHint: '장기 평균 2%로 봅니다. 수십 년 뒤에 쓸 돈이므로 오늘의 1만 위안은 20년 뒤 같은 것을 살 수 없습니다.',
    moreInflation1: '1~2년은 무시해도 되지만, 70~80년의 지출을 계산할 때는 반드시 넣어야 합니다. 보장해야 하는 것은 "매달 1만 위안"이 아니라 "오늘의 1만 위안과 같은 구매력"이기 때문입니다.',

    rrReal: '실질 수익률', rrMult: '평생 승수',
    rrNote: '수익률에서 물가를 빼면 실질 수익입니다. 승수 = 12개월 ÷ 실질 수익률.',

    resLabel: '당신의 재무 자유 숫자', resLive: '실시간', ringCap: '달성',
    resHave: '현재 투자가능 자산', resBreak: '이 숫자가 나온 과정',
    bkCore: '생활비 × 승수', bkKids: '자녀', bkHealth: '의료비', bkHouse: '주택',
    mintBtn: '내 배지 만들기', mintShort: '배지 만들기',
    resultNote: '어디까지나 추정입니다. 수익률과 물가는 가정이며 인생에 정답은 없습니다. 이 숫자의 쓸모는 선택을 보이게 하는 것입니다.',

    expTitle: '공식의 각 항목이 말하는 것',
    expSub: '금융 지식은 필요 없습니다. 세 가지만 이해하면 무엇을 입력할지 알 수 있습니다.',
    exp1T: '왜 480배인가?',
    exp1B: '돈이 매년 물가를 빼고 2.5%를 벌어준다고 가정합니다(4.5% 수익 − 2% 물가). 1년 12개월치 지출을 감당하려면 12 ÷ 2.5% = 480개월치가 필요합니다. 오늘의 480위안이 평생 매달 1위안이 되는 셈입니다.',
    exp2T: '예금만으로는 왜 안 되나?',
    exp2B: '1년 예금 0.95%, 5년 1.3%, 물가는 매년 약 1%. 물 위에 서 있는 셈이라 파도가 오면 가라앉습니다. 예금이 물가를 못 따라가는 것은 중국, 미국, 일본, 유럽 모두 같습니다. 그래서 장기적이고 합리적인 투자가 전제입니다.',
    exp3T: '자녀·의료·주택은 왜 따로?',
    exp3B: '이 세 가지는 봉인된 돈입니다. 투자하지 않고 이자도 없이 옆에 두는 돈이죠. 반면 노후는 이미 월 지출 안에 있습니다. 지금 수준으로 평생 쓰면 노년의 소비 감소가 간병비 증가를 대략 상쇄합니다. 그래서 별도 항목이 없습니다.',
    exp4T: '결국 인생 설계입니다',
    exp4B: '가치는 숫자가 아니라 과정에 있습니다. 얼마를 쓰고 싶은지, 아이를 원하는지, 어디 살고 싶은지, 무엇을 원하는지 답하게 되니까요. 숫자를 줄이는 지렛대는 대개 수익률이 아니라 욕망의 모양입니다.',
    quote: '“재무 자유 이후의 행복을 과대평가하지도, 눈앞의 아름다움을 놓치지도 마세요.”',
    quoteBy: '— 小Lin说',

    footNote: '오픈 계산 모델입니다. 공식과 데이터는 「小Lin说」영상 《당신에게 재무 자유는 얼마가 필요할까?》를 참고했습니다. 모든 수익률·물가·비용은 가정치이며 투자 조언이 아닙니다.',
    footMade: 'Made for people who want to see their own number.',

    tabBadge: '내 배지', tabPlan: '몇 년 걸리나',
    saveImg: '이미지 저장', shareNow: '공유',
    badgeTip: '이미지를 저장해 어디든 올릴 수 있습니다. 일련번호는 당신의 숫자로 생성됩니다.',
    planTitle: '오늘부터 저축하면 몇 년 걸리나',
    planSub: '매년 모은 돈을 위와 같은 수익률로 투자한다고 가정합니다.',
    piSave: '매달 모을 수 있는 돈', piGrowth: '매년 늘어나는 저축',
    lgAsset: '내 돈', lgTarget: '도달해야 할 선',
    planNote: '십 년 넘게 변화가 없다가 갑자기 가팔라집니다. 그래서 일찍 시작하는 것이 수익률을 조금 올리는 것보다 강력합니다.',

    unitWan: '만', unitYi: '억',
    chips: ['¥3천 최소', '¥6천 2선', '¥1만 쾌적', '¥1.5만 1선', '¥2.5만 프리미엄'],
    gapNeed: '{x} 남음', gapDone: '이미 넘었습니다',
    insDone: '이 가정대로면 이미 자유선을 넘었습니다 — 월 {x}를 써도 원금이 줄지 않습니다.',
    insCore: '생활비가 임계값의 {p}%입니다. X를 조절하는 것이 가장 강력한 지렛대입니다. 월 1,000위안을 줄이면 48만 위안이 사라집니다.',
    insHouse: '주택이 임계값의 {p}%입니다 — 수익을 내지 않는 유일한 항목이자 가장 재정의하기 쉬운 항목입니다.',
    insGap: '자유까지 {g} 남았습니다. 매달 {s}씩 모으면 몇 년이 걸리는지 저축 계획에서 확인하세요.',
    insInvalid: '실질 수익률은 0보다 커야 합니다. 명목 수익률을 올리거나 물가상승률을 낮춰 주세요.',
    badgeLine: '{n}, 이것이 당신의 숫자입니다. 일련번호는 이 숫자에서 생성됩니다.',
    serialCap: '번호', dateCap: '발급', amountCap: '재무 자유',
    kpiYears: '달성까지', kpiInvest: '누적 투입', kpiGain: '투자 수익',
    kpiNeed30: '월 저축 · 30년', kpiInvest60: '60년 누적 투입', kpiEnd60: '60년 후 자산',
    yearUnit: '년', never: '60년 내 미달성',
    toastSaved: '이미지가 저장되었습니다', toastCopied: '클립보드에 복사됨', toastFail: '저장 실패, 이미지를 길게 눌러 저장하세요',
    shareText: '내 재무 자유 숫자는 {x}입니다. 당신은요?',
    srcCap: '출처',
    srcList: '중국 국가통계국 2025 · 《중국 출산비용 보고서》2024 · 전국 사회보장기금 · 기업연금 2007–2024',
    ranks: ['가벼움', '출발', '도시', '여유', '대도시', '별빛'],
    etaLabel: '{y}년 후 달성',

    kCalc: '계산기', kFormula: '공식', kGuide: '계산 안내', kFaq: '자주 묻는 질문',
    ctaGuide: '입력 방법 보기',
    bubble1: '저도 계산해봤어요', bubble2: '생각보다 무섭지 않아요',
    hs1: '평생 승수', hs2: '가정한 실질 수익률', hs3: '단계만 채우면 끝',
    rcSub: '이만큼 모으면 다시는 돈을 위해 일하지 않아도 됩니다',
    kids0: '없음', kids1: '1명', kids2: '2명', kids3: '3명',
    sceneT: '집, 아이, 부모님, 그리고 건강',
    sceneB: '당신이 짊어진 것은 빚이 아니라 소중한 것들입니다. 숫자가 크다고 부끄러워할 일은 없습니다. 이미 지고 있던 것을 처음으로 정확히 계산했을 뿐입니다.',
    formulaTitle: '480이라는 숫자는 어디서 나왔나',
    formulaSub: '금융 지식은 필요 없습니다. 이 한 줄만 이해하면 월 1만 위안에 왜 480만 위안이 필요한지 알 수 있습니다.',
    fbK1: '필요한 돈', fbK2: '월 지출', fbK3: '자녀', fbK4: '의료비', fbK5: '주택',
    fbNote: '생각이 필요한 부분은 이 480 하나뿐입니다.',
    guideTitle: '네 단계만 채우면 틀릴 수 없습니다',
    guideSub: '어떤 칸에 무엇을 넣을지 잊었다면 이 페이지로 돌아오세요.',
    guide: [
      ['한 달에 얼마 쓰는지 먼저 계산하세요', '최근 세 달 생활비를 더해 3으로 나누면 실제 월 지출이 나옵니다. 원 단위까지 정확할 필요는 없습니다.']
      , ['자녀, 의료비, 주택은 따로 넣으세요', '이 세 가지는 이자로 불어나지 않는 일시적 큰돈이라 총액에 그대로 더합니다. 해당되면 채우고, 아니면 0을 넣으세요.']
      , ['수익률이 애매하면 4.5%를 쓰세요', '이건 당신이 정하는 게 아니라 시장이 정합니다. 낮게 넣으면 목표가 커지고(안전), 높게 넣으면 작아집니다(위험).']
      , ['여러 번 바꿔보며 무엇이 중요한지 확인하세요', '숫자를 바꿀 때마다 결과가 즉시 바뀝니다. 열 번쯤 해보면 내가 가장 줄이기 싫은 항목이 보입니다.']
    ],
    faqTitle: '숫자가 너무 크게 나왔는데요',
    faqSub: '계산 후 가장 많이 받는 질문들입니다.',
    faq: [
      ['천만이 넘게 나왔어요. 가망이 없는 걸까요?', '아닙니다. 이 숫자는 다시는 일하지 않고, 원금을 1원도 쓰지 않으며, 구매력이 절대 떨어지지 않는다고 가정한 가장 엄격한 버전입니다. 실제로는 월급도, 사회보험도, 오를 수도 있는 집도 있고, 은퇴 후 지출은 줄어듭니다.']
      , ['왜 월 1만 위안에 480만 위안이 필요한가요?', '이자로 생활하기 때문입니다. 480만 위안을 실질 수익률 2.5%로 운용하면 연 12만 위안, 즉 월 1만 위안이 나오고 원금은 그대로입니다. 그게 "평생 쓰고도 남는다"는 뜻입니다.']
      , ['집이 있는데 주택 비용도 넣어야 하나요?', '아니요, 그 칸은 0입니다. 다만 관리비, 수리비, 재산세는 월 지출에 포함하세요.']
      , ['4.5% 수익률은 믿을 만한가요?', '물가 상승을 뺀 장기 가정이며, 사회보장기금 같은 기관의 실제 성과를 참고했습니다. 개인 투자자는 비용을 빼면 약 4~4.5%입니다. 매년 보장되지는 않지만 장기 계획에는 가장 합리적인 가정입니다.']
      , ['이 숫자는 나중에 바뀌나요?', '네. 도시, 직장, 자녀 계획, 부모님 건강 중 하나만 바뀌어도 숫자가 달라집니다. 판결이 아니라 건강검진 수치라고 생각하세요.']
    ],
    fKidsHint: '모르면 「없음」으로 두고 숫자가 어떻게 줄어드는지 보세요. 자녀 비용이 궁금하면 1명을 선택해 보세요.',

  },

  fr: {
    brand: 'Calculateur de liberté', brandSub: 'Freedom Number',
    eyebrow: 'Inspiré de la formule de 「小Lin说」',
    heroLine1: 'De combien avez-vous', heroLine2: 'vraiment besoin ?',
    heroLead: 'Certains disent 5 M¥, d\'autres 100 M¥. Mais ce sont les chiffres des autres. Voici une formule qui traduit votre façon de vivre en un seul nombre.',
    formulaLabel: 'Votre seuil de liberté', formulaBody: '480 × dépenses mensuelles + enfants + santé + gros achats',
    multCap: 'multiplicateur à vie', ctaStart: 'Calculer mon nombre', ctaWhy: 'D\'où vient chaque terme',
    heroNote: 'Ce n\'est pas un jeu de devinettes. L\'hypothèse : vous ne travaillez plus, votre niveau de vie ne baisse pas, le capital ne diminue pas, le pouvoir d\'achat ne s\'érode jamais.',

    calcTitle: 'Quatre étapes, sans erreur possible',
    calcSub: 'Chaque case indique quoi mettre et pourquoi. En cas de doute, gardez la valeur par défaut : tout est modifiable.',

    s1Title: 'Combien coûte un mois ?',
    s1Sub: 'C\'est le X — la variable la plus importante. Elle détermine environ 80 % du résultat.',
    fMonthly: 'Dépenses mensuelles', perMonth: '/mois',
    fMonthlyHint: 'Alimentation, vêtements, transport, loyer ou crédit, santé, loisirs, voyages, charges — tout compte. Exclus : le logement et les enfants, traités à l’étape 2.',
    moreMonthly1: 'La vraie question n\'est pas « combien puis-je économiser », mais « quel niveau de vie suis-je prêt à échanger contre quel nombre ». Chaque 1 000 ¥ de plus par mois ajoute environ 480 000 ¥ à votre seuil.',
    moreMonthly2: 'Repère : en 2025, la consommation moyenne en Chine est de 2 456 ¥/mois par personne, 2 990 ¥ pour les citadins. Un couple multiplie simplement par deux.',

    s2Title: 'Les quelques grosses sommes',
    s2Sub: 'De l\'argent bloqué qui ne rapporte rien. Il s\'ajoute directement au capital.',
    fKids: 'Combien d’enfants ?', fChildCost: 'Coût total par enfant', perWan: '×10k', perWanPlain: '×10k',
    fChildHint: 'De la grossesse à 18 ans. Moyenne nationale 580 k¥ ; Pékin ~1 M¥, Shanghai ~1,08 M¥, Guizhou ~430 k¥.',
    moreChild1: 'Selon le rapport chinois sur le coût des enfants : en 2024, un enfant coûte 2 543,84 ¥/mois en moyenne, soit environ 580 000 ¥ jusqu\'à 18 ans. Le chiffre suit de près le PIB régional — Shanghai 1,08 M¥, Pékin 1 M¥, Guizhou 430 k¥. Rapporté au PIB par habitant, élever un enfant en Chine est le deuxième plus cher au monde, après la Corée du Sud.',
    moreChild2: 'Note : le coût marginal baisse avec le nombre d\'enfants (environ −15 % par enfant supplémentaire), non pris en compte ici.',
    fHealth: 'Une réserve pour la maladie',
    fHealthHint: 'En cas de maladie grave. 150–300 k¥ en ville moyenne, 300–600 k¥ dans les grandes. Cet argent n’est pas investi et ne rapporte rien : il reste là.',
    moreHealth1: 'Le poste le plus flou et le plus sous-estimé. Selon les estimations 2025, les dépenses de santé sur une vie atteignent environ 200 000 ¥ par personne ; par ville, 150–300 k¥ en ville moyenne et 300–600 k¥ dans les grandes. C\'est de l\'argent scellé : ni investi, ni rémunéré, simplement en attente.',
    fHouse: 'Le prix d’un logement',
    fHouseHint: 'Au prix actuel de celui que vous voulez vraiment. Déjà propriétaire ? Mettez 0. Locataire à vie ? Ajoutez le loyer à vos dépenses mensuelles.',
    moreHouse1: 'Prenez le prix actuel du logement que vous voulez vraiment et ajoutez-le tel quel — sans inflation ni rendement, car cet argent sera dépensé, pas placé. Si vous êtes logé, c\'est 0. Si vous comptez louer à vie, convertissez-le en loyer mensuel et intégrez-le au X.',

    s3Title: 'Ce que votre argent rapporte',
    s3Sub: 'Le socle de toute la formule. Chaque 0,5 % de rendement réel en moins gonfle considérablement votre nombre.',
    fNominal: 'Ce que rapporte votre argent par an',
    fNominalHint: 'Un dépôt à un an rapporte 0,95 %. Avec une allocation long terme raisonnable, un particulier obtient environ 4 à 4,5 % après frais. Dans le doute : 4,5 %.',
    moreNominal1: 'Les dépôts perdent contre l\'inflation — 0,95 % à un an, 1,3 % à cinq ans, face à une inflation sous-jacente proche de 1,0 %. Vous flottez à peine. Un rendement réel positif exige actions et obligations. Les professionnels chinois ont réussi : 7,39 % par an pour le fonds de sécurité sociale (2000–2024), 6,17 % pour les retraites d\'entreprise (2007–2024). Mais ce sont les rendements des gérants : après frais visibles et cachés, un particulier perd encore 2 à 3 points.',
    moreNominal2: 'D\'où l\'hypothèse de la vidéo : une allocation long terme raisonnable rapporte 4 à 4,5 % nominal. C\'est la valeur par défaut ici.',
    fInflation: 'La hausse des prix',
    fInflationHint: '2 % en moyenne longue. Vous dépensez de l’argent dans plusieurs décennies : 10 000 ¥ d’aujourd’hui n’achèteront pas la même chose dans vingt ans.',
    moreInflation1: 'Sur un ou deux ans, on peut l\'ignorer. Mais vous planifiez 70 à 80 ans de dépenses : elle doit entrer dans le calcul. Ce qu\'il faut garantir, ce n\'est pas « 10 000 ¥ par mois », mais « 10 000 ¥ par mois en pouvoir d\'achat d\'aujourd\'hui ».',

    rrReal: 'Rendement réel', rrMult: 'Multiplicateur',
    rrNote: 'Rendement moins inflation = rendement réel. Multiplicateur = 12 mois ÷ rendement réel.',

    resLabel: 'Votre nombre de liberté', resLive: 'en direct', ringCap: 'atteint',
    resHave: 'Vos actifs investissables', resBreak: 'Comment ce chiffre est construit',
    bkCore: 'Dépenses × multiplicateur', bkKids: 'Enfants', bkHealth: 'Réserve santé', bkHouse: 'Logement',
    mintBtn: 'Créer mon badge', mintShort: 'Créer le badge',
    resultNote: 'Une simple estimation. Rendements et inflation sont des hypothèses, et la vie n’a pas de corrigé. Ce chiffre sert à rendre vos choix visibles.',

    expTitle: 'Ce que dit chaque terme',
    expSub: 'Pas besoin d\'être financier. Trois idées suffisent pour savoir quoi saisir.',
    exp1T: 'Pourquoi 480× ?',
    exp1B: 'Supposez que votre argent rapporte 2,5 % au-dessus de l’inflation (4,5 % moins 2 %). Pour couvrir 12 mois de dépenses, il faut 12 ÷ 2,5 % = 480 mois de dépenses. Voilà le multiplicateur : 480 ¥ aujourd’hui, c’est 1 ¥ de plus chaque mois, à vie.',
    exp2T: 'Pourquoi pas un simple livret ?',
    exp2B: 'Un dépôt à un an : 0,95 % ; à cinq ans : 1,3 % ; les prix montent d’environ 1 %. Vous êtes à la ligne de flottaison, chaque vague vous enfonce. Les dépôts perdent contre l’inflation en Chine, aux États-Unis, au Japon comme en Europe. D’où le préalable absolu : investir longtemps et raisonnablement.',
    exp3T: 'Pourquoi enfants, maladie et logement à part ?',
    exp3B: 'Ces trois sommes sont scellées : ni investies, ni rémunérées, simplement mises de côté. La retraite, elle, est déjà dans les dépenses mensuelles : vous dépensez au niveau actuel à vie, et les frais de dépendance sont à peu près compensés par une consommation plus faible en vieillissant.',
    exp4T: 'C’est un plan de vie',
    exp4B: 'La valeur n’est pas le chiffre mais le parcours : vous êtes obligé de répondre — combien je veux dépenser, est-ce que je veux des enfants, où vivre, qu’est-ce que je veux vraiment. Le vrai levier n’est souvent pas le rendement, mais la forme de vos envies.',
    quote: '« N\'exagérez jamais le bonheur d\'après la liberté financière, et ne négligez jamais la beauté juste devant vous. »',
    quoteBy: '— 小Lin说',

    footNote: 'Modèle de calcul ouvert. Formule et données inspirées de la vidéo « De combien avez-vous besoin pour être libre financièrement ? » de 小Lin说. Rendements, inflation et coûts sont des hypothèses, sans valeur de conseil en investissement.',
    footMade: 'Made for people who want to see their own number.',

    tabBadge: 'Mon badge', tabPlan: 'Combien d’années',
    saveImg: 'Enregistrer', shareNow: 'Partager',
    badgeTip: 'Enregistrez l\'image et publiez-la où vous voulez. Le numéro de série est généré à partir de vos chiffres.',
    planTitle: 'À partir d’aujourd’hui, combien de temps',
    planSub: 'En supposant que vous investissez chaque année ce que vous épargnez, au même rendement.',
    piSave: 'Vous pouvez épargner par mois', piGrowth: 'Épargne qui augmente chaque année',
    lgAsset: 'Votre argent', lgTarget: 'La ligne à atteindre',
    planNote: 'Rien ne semble bouger pendant dix ans, puis la courbe décolle. C’est pourquoi commencer tôt vaut mieux que gagner un peu plus.',

    unitWan: '×10k', unitYi: '×100M',
    chips: ['3 k¥ minimal', '6 k¥ ville moyenne', '10 k¥ confort', '15 k¥ grande ville', '25 k¥ premium'],
    gapNeed: '{x} restants', gapDone: 'Seuil dépassé',
    insDone: 'Avec ces hypothèses, vous avez déjà dépassé votre seuil — dépenser {x} par mois n\'entame plus le capital.',
    insCore: 'Les dépenses courantes représentent {p} % de votre seuil. Contrôler X est le levier le plus puissant : 1 000 ¥ de moins par mois, c\'est 480 000 ¥ en moins.',
    insHouse: 'Le logement pèse {p} % de votre seuil — le seul poste qui ne rapporte rien, et le plus redéfinissable.',
    insGap: 'Il vous manque {g}. En épargnant {s} par mois, ouvrez le plan pour voir combien d\'années il faut.',
    insInvalid: 'Le rendement réel doit être positif. Augmentez le rendement nominal ou baissez l’inflation.',
    badgeLine: '{n} — voici votre nombre. Le numéro de série en découle, et il n’appartient qu’à vous.',
    serialCap: 'N°', dateCap: 'Émis le', amountCap: 'LIBERTÉ FINANCIÈRE',
    kpiYears: 'Années restantes', kpiInvest: 'Total épargné', kpiGain: 'Gains',
    kpiNeed30: 'Épargne/mois · 30 ans', kpiInvest60: 'Versé · 60 ans', kpiEnd60: 'Actifs · 60 ans',
    yearUnit: 'ans', never: 'Pas en 60 ans',
    toastSaved: 'Image enregistrée', toastCopied: 'Copié', toastFail: 'Échec, appui long sur l\'image',
    shareText: 'Mon nombre de liberté est {x}. Et le vôtre ?',
    srcCap: 'Sources',
    srcList: 'Bureau national de la statistique 2025 · Rapport sur le coût des enfants 2024 · Fonds de sécurité sociale · Retraites d’entreprise 2007–2024',
    ranks: ['Plume', 'Élan', 'Urbain', 'Sérénité', 'Métropole', 'Stellaire'],
    etaLabel: 'Atteint dans {y} ans',

    kCalc: 'Calculateur', kFormula: 'La formule', kGuide: 'Mode d’emploi', kFaq: 'Questions',
    ctaGuide: 'Comment remplir ?',
    bubble1: 'Je l’ai fait aussi', bubble2: 'Ce n’est pas si effrayant',
    hs1: 'multiplicateur à vie', hs2: 'rendement réel supposé', hs3: 'étapes vers votre réponse',
    rcSub: 'Avec cette somme, vous n’aurez plus jamais à travailler pour de l’argent',
    kids0: 'Aucun', kids1: '1', kids2: '2', kids3: '3',
    sceneT: 'Un logement, des enfants, des parents, la santé',
    sceneB: 'Ce que vous portez n’est pas une dette, c’est ce qui vous tient à cœur. Un grand nombre n’a donc rien de honteux : c’est simplement le premier calcul honnête de ce que vous portiez déjà.',
    formulaTitle: 'D’où vient le 480 ?',
    formulaSub: 'Aucune connaissance financière requise. Comprenez cette ligne et vous saurez pourquoi 10 000 ¥ par mois demandent 4,8 M¥.',
    fbK1: 'Somme nécessaire', fbK2: 'Dépenses mensuelles', fbK3: 'Enfants', fbK4: 'Santé', fbK5: 'Logement',
    fbNote: 'La seule partie qui demande réflexion, c’est ce 480.',
    guideTitle: 'Quatre étapes, impossible de se tromper',
    guideSub: 'Si vous oubliez à quoi correspond une case, revenez sur cette page.',
    guide: [
      ['Calculez d’abord votre mois', 'Additionnez vos trois derniers mois de dépenses, divisez par trois. C’est votre vrai montant mensuel. Pas besoin d’être précis au yuan.']
      , ['Enfants, santé, logement : à part', 'Ces trois sommes sont ponctuelles et ne rapportent rien : elles s’ajoutent directement au total. Remplissez si concerné, sinon mettez 0.']
      , ['Rendement incertain ? Mettez 4,5 %', 'Ce n’est pas vous qui décidez, c’est le marché. Plus bas, votre objectif grandit (plus sûr) ; plus haut, il rétrécit (plus risqué).']
      , ['Modifiez plusieurs fois et voyez ce qui compte', 'Chaque changement recalcule tout de suite. Après dix essais, vous verrez quelle ligne vous refusez le plus de réduire.']
    ],
    faqTitle: 'Le chiffre est énorme. Et alors ?',
    faqSub: 'Voici les questions les plus fréquentes après le calcul.',
    faq: [
      ['Plus de dix millions : est-ce sans espoir ?', 'Non. Ce chiffre suppose que vous ne travaillez plus jamais, ne touchez pas au capital et ne perdez aucun pouvoir d’achat : la version la plus stricte. La vraie vie comprend un salaire, une protection sociale, un logement qui peut prendre de la valeur et des dépenses qui baissent à la retraite.']
      , ['Pourquoi 10 000 ¥ par mois exigent-ils 4,8 M¥ ?', 'Parce que vous vivez des intérêts. À 2,5 % de rendement réel, 4,8 M¥ rapportent 120 000 ¥ par an, soit exactement 10 000 ¥ par mois, sans que le capital baisse d’un yuan. C’est ce que veut dire « ne jamais s’épuiser ».']
      , ['J’ai déjà un logement. Dois-je l’ajouter ?', 'Non, mettez 0. Mais les charges, l’entretien et la taxe foncière font partie de vos dépenses mensuelles.']
      , ['Un rendement de 4,5 % est-il crédible ?', 'C’est une hypothèse de long terme après inflation, fondée sur les résultats réels d’institutions comme le fonds de sécurité sociale : environ 4 à 4,5 % pour un particulier après frais. Ce n’est pas garanti chaque année, mais c’est l’hypothèse la plus raisonnable pour planifier.']
      , ['Ce chiffre changera-t-il plus tard ?', 'Oui. Changer de ville, d’emploi, avoir un enfant, la santé des parents : tout cela le déplace. Voyez-le comme un bilan de santé, pas comme un verdict.']
    ],
    fKidsHint: 'Vous hésitez ? Commencez par aucun et regardez le chiffre baisser. Curieux du vrai coût d’un enfant ? Choisissez-en un.',

  },

  ru: {
    brand: 'Калькулятор свободы', brandSub: 'Freedom Number',
    eyebrow: 'По мотивам формулы 「小Lin说」',
    heroLine1: 'Сколько денег вам', heroLine2: 'нужно на самом деле?',
    heroLead: 'Кто-то говорит, что хватит пяти миллионов юаней, кто-то — что нужно сто. Но это чужие цифры. Вот формула, которая превращает ваш образ жизни в одно число.',
    formulaLabel: 'Ваш порог свободы', formulaBody: '480 × расходы в месяц + дети + здоровье + крупные траты',
    multCap: 'пожизненный множитель', ctaStart: 'Узнать моё число', ctaWhy: 'Откуда каждый пункт',
    heroNote: 'Это не игра в угадайку. Допущение: вы не работаете, уровень жизни не падает, капитал не уменьшается, покупательная способность не снижается никогда.',

    calcTitle: 'Четыре шага — и готово',
    calcSub: 'В каждом поле написано, что вписать и почему. Сомневаетесь — оставьте значение по умолчанию, поменять можно в любой момент.',

    s1Title: 'Сколько вы тратите в месяц',
    s1Sub: 'Это X — самая важная переменная. Она определяет около 80% результата.',
    fMonthly: 'Расходы в месяц', perMonth: '¥/мес',
    fMonthlyHint: 'Еда, одежда, транспорт, аренда или ипотека, медицина, досуг, путешествия, коммунальные — всё. Не входят жильё и дети: они на шаге 2.',
    moreMonthly1: 'Настоящий вопрос здесь не «сколько я смогу сэкономить», а «какой уровень жизни я готов обменять на какое число». Каждые 1 000 ¥ в месяц добавляют к порогу примерно 480 000 ¥.',
    moreMonthly2: 'Ориентир: в 2025 году средние расходы на потребление в Китае — 2 456 ¥/мес на человека, у горожан 2 990 ¥. Для пары просто умножаем на два.',

    s2Title: 'Несколько крупных сумм',
    s2Sub: 'Это «запечатанные» деньги: они не приносят дохода, а просто лежат. Складываются прямо с капиталом.',
    fKids: 'Сколько детей?', fChildCost: 'Полная стоимость одного ребёнка', perWan: '×10 тыс.', perWanPlain: '×10 тыс.',
    fChildHint: 'От беременности до 18 лет. В среднем по стране 580 тыс. ¥; Пекин ~1 млн, Шанхай ~1,08 млн, Гуйчжоу ~430 тыс.',
    moreChild1: 'По китайскому отчёту о стоимости воспитания: в 2024 году ребёнок стоит в среднем 2 543,84 ¥ в месяц, то есть около 580 тыс. ¥ до 18 лет. Цифра тесно связана с ВРП региона — Шанхай 1,08 млн, Пекин 1 млн, Гуйчжоу 430 тыс. Относительно ВВП на душу населения воспитывать ребёнка в Китае — второе самое дорогое в мире после Южной Кореи.',
    moreChild2: 'Примечание: с каждым следующим ребёнком удельная стоимость падает примерно на 15%, здесь это не учитывается.',
    fHealth: 'Резерв на лечение',
    fHealthHint: 'На случай серьёзной болезни. 150–300 тыс. ¥ в городах второго уровня, 300–600 тыс. в первом. Эти деньги не инвестируются и не приносят процентов — просто лежат.',
    moreHealth1: 'Самая неопределённая и самая недооценённая статья. По оценкам 2025 года, пожизненные расходы на медицину — около 200 тыс. ¥ на человека; по городам: 150–300 тыс. во втором уровне, 300–600 тыс. в первом. Это запечатанные деньги: не инвестируются, не приносят процентов, просто ждут своего дня.',
    fHouse: 'Стоимость жилья',
    fHouseHint: 'По сегодняшней цене того жилья, которое действительно хотите. Есть своё — ставьте 0. Снимаете всегда — добавьте аренду в расходы на шаге 1.',
    moreHouse1: 'Возьмите текущую рыночную цену жилья, которое действительно хотите, и прибавьте как есть — без инфляции и доходности, потому что эти деньги будут потрачены, а не приумножены. Есть где жить — 0. Собираетесь снимать всегда — переведите в месячную аренду и внесите в X.',

    s3Title: 'Сколько приносят деньги',
    s3Sub: 'Фундамент всей формулы. Каждые 0,5% реальной доходности вниз заметно увеличивают ваше число.',
    fNominal: 'Сколько приносят деньги в год',
    fNominalHint: 'Годовой депозит даёт 0,95%. При разумном долгосрочном портфеле обычный инвестор получает примерно 4–4,5% после всех комиссий. Не уверены — ставьте 4,5%.',
    moreNominal1: 'Депозиты проигрывают инфляции — 0,95% на год, 1,3% на пять лет при базовой инфляции около 1,0%. Вы едва держитесь на поверхности. Для положительной реальной доходности нужны акции и облигации. Китайские профессионалы выступали неплохо: фонд соцстрахования 7,39% в год в 2000–2024, корпоративные пенсионные фонды 6,17% в 2007–2024. Но это доходность управляющих: после явных и скрытых комиссий частный инвестор теряет ещё 2–3 процентных пункта.',
    moreNominal2: 'Отсюда допущение из видео: разумное долгосрочное распределение даёт 4–4,5% номинально. Это значение по умолчанию.',
    fInflation: 'Насколько растут цены',
    fInflationHint: 'В среднем 2% на длинном горизонте. Вы тратите деньги через десятки лет: 10 000 ¥ сегодня через двадцать лет купят меньше.',
    moreInflation1: 'На горизонте года-двух инфляцию можно игнорировать. Но вы планируете расходы на 70–80 лет, поэтому она обязана быть в расчёте. Гарантировать нужно не «10 000 ¥ в месяц», а «10 000 ¥ в месяц в сегодняшней покупательной способности».',

    rrReal: 'Реальная доходность', rrMult: 'Множитель',
    rrNote: 'Доходность минус инфляция = реальная доходность. Множитель = 12 месяцев ÷ реальная доходность.',

    resLabel: 'Ваше число свободы', resLive: 'онлайн', ringCap: 'достигнуто',
    resHave: 'Ваши инвестируемые активы', resBreak: 'Как получилась эта сумма',
    bkCore: 'Расходы × множитель', bkKids: 'Дети', bkHealth: 'Резерв на лечение', bkHouse: 'Жильё',
    mintBtn: 'Создать мой значок', mintShort: 'Создать значок',
    resultNote: 'Это лишь оценка. Доходность и инфляция — допущения, а у жизни нет ответов. Смысл числа — сделать ваш выбор видимым.',

    expTitle: 'Что говорит каждый пункт',
    expSub: 'Финансовое образование не нужно. Поймите три идеи — и узнаете, что вписывать.',
    exp1T: 'Почему 480×?',
    exp1B: 'Допустим, деньги приносят 2,5% сверх инфляции (4,5% минус 2%). Чтобы покрыть 12 месяцев расходов, нужно 12 ÷ 2,5% = 480 месячных сумм. Вот множитель: 480 ¥ сегодня — это 1 ¥ каждый месяц до конца жизни.',
    exp2T: 'Почему не обычный вклад?',
    exp2B: 'Годовой депозит 0,95%, пятилетний 1,3%, а цены растут примерно на 1% в год. Вы стоите на уровне воды, и каждая волна тянет вниз. Вклады проигрывают инфляции в Китае, США, Японии и Европе одинаково. Отсюда жёсткое условие: долгосрочные и разумные инвестиции.',
    exp3T: 'Почему дети, лечение и жильё отдельно?',
    exp3B: 'Эти три суммы «запечатаны»: не инвестируются, не приносят дохода, просто отложены. Пенсия же уже внутри месячных расходов: вы тратите на сегодняшнем уровне всю жизнь, а рост затрат на уход компенсируется меньшими тратами в старости.',
    exp4T: 'На самом деле это план жизни',
    exp4B: 'Ценность не в числе, а в процессе: вы вынуждены ответить — сколько хочу тратить, нужны ли дети, где жить, чего я вообще хочу. Главный рычаг обычно не доходность, а форма желаний.',
    quote: '«Никогда не переоценивайте радость после финансовой свободы и не упускайте красоту прямо перед вами.»',
    quoteBy: '— 小Lin说',

    footNote: 'Открытая расчётная модель. Формула и данные — по видео 「小Lin说」 «Сколько денег нужно для финансовой свободы?». Все доходности, инфляция и затраты — допущения, не инвестиционная рекомендация.',
    footMade: 'Made for people who want to see their own number.',

    tabBadge: 'Мой значок', tabPlan: 'Сколько лет',
    saveImg: 'Сохранить', shareNow: 'Поделиться',
    badgeTip: 'Сохраните картинку и публикуйте где угодно. Номер создаётся из ваших цифр.',
    planTitle: 'С сегодняшнего дня — сколько лет',
    planSub: 'При условии, что вы инвестируете накопленное за год с той же доходностью.',
    piSave: 'Сколько можете откладывать в месяц', piGrowth: 'Накопления растут каждый год',
    lgAsset: 'Ваши деньги', lgTarget: 'Линия, до которой дойти',
    planNote: 'Лет десять ничего не заметно, а потом кривая резко идёт вверх. Поэтому начать раньше выгоднее, чем получить чуть больше.',

    unitWan: '×10 тыс.', unitYi: '×100 млн',
    chips: ['3 тыс. минимум', '6 тыс. 2-й уровень', '10 тыс. комфорт', '15 тыс. столица', '25 тыс. премиум'],
    gapNeed: 'осталось {x}', gapDone: 'Порог пройден',
    insDone: 'При этих допущениях вы уже за порогом — тратить {x} в месяц можно, не трогая капитал.',
    insCore: 'Текущие расходы — {p}% вашего порога. Управление X — самый мощный рычаг: минус 1 000 ¥ в месяц убирает 480 000 ¥.',
    insHouse: 'Жильё — {p}% порога. Единственная статья, которая не приносит дохода, и самая переопределяемая.',
    insGap: 'До свободы осталось {g}. Откладывая {s} в месяц, откройте план накоплений, чтобы увидеть срок.',
    insInvalid: 'Реальная доходность должна быть больше нуля. Поднимите номинальную доходность или снизьте инфляцию.',
    badgeLine: '{n} — вот ваше число. Номер выведен из него и принадлежит только вам.',
    serialCap: 'Номер', dateCap: 'Выдан', amountCap: 'ФИНАНСОВАЯ СВОБОДА',
    kpiYears: 'Лет до цели', kpiInvest: 'Всего внесено', kpiGain: 'Доход от инвестиций',
    kpiNeed30: 'В месяц · 30 лет', kpiInvest60: 'Внесено · 60 лет', kpiEnd60: 'Активы · 60 лет',
    yearUnit: 'лет', never: 'Не за 60 лет',
    toastSaved: 'Изображение сохранено', toastCopied: 'Скопировано', toastFail: 'Не удалось, удерживайте картинку',
    shareText: 'Моё число свободы — {x}. А ваше?',
    srcCap: 'Источники',
    srcList: 'Госстат КНР 2025 · Отчёт о стоимости воспитания 2024 · Фонд соцстрахования · Корпоративные пенсии 2007–2024',
    ranks: ['Лёгкость', 'Старт', 'Город', 'Покой', 'Мегаполис', 'Звёздный'],
    etaLabel: 'Через {y} лет',

    kCalc: 'Калькулятор', kFormula: 'Формула', kGuide: 'Как заполнять', kFaq: 'Вопросы',
    ctaGuide: 'Как это заполнять?',
    bubble1: 'Я тоже считал', bubble2: 'Это не так страшно',
    hs1: 'пожизненный множитель', hs2: 'реальная доходность', hs3: 'шага до ответа',
    rcSub: 'С такой суммой вам больше никогда не придётся работать ради денег',
    kids0: 'Нет', kids1: '1', kids2: '2', kids3: '3',
    sceneT: 'Жильё, дети, родители, здоровье',
    sceneB: 'То, что вы несёте, — не долг, а то, что вам дорого. Большая сумма здесь не постыдна: это просто первый честный подсчёт того, что вы и так уже несёте.',
    formulaTitle: 'Откуда взялось 480?',
    formulaSub: 'Финансовое образование не нужно. Поймите эту строку — и узнаете, почему 10 000 ¥ в месяц требуют 4,8 млн ¥.',
    fbK1: 'Нужная сумма', fbK2: 'Расходы в месяц', fbK3: 'Дети', fbK4: 'Здоровье', fbK5: 'Жильё',
    fbNote: 'Единственное, над чем стоит подумать, — это 480.',
    guideTitle: 'Четыре шага, ошибиться невозможно',
    guideSub: 'Забыли, что значит поле, — вернитесь на эту страницу.',
    guide: [
      ['Сначала посчитайте свой месяц', 'Сложите расходы за последние три месяца и разделите на три. Это ваша настоящая месячная сумма. До юаня точно не нужно.']
      , ['Дети, здоровье, жильё — отдельно', 'Эти три суммы разовые, они не приносят процентов, поэтому просто прибавляются к итогу. Есть — впишите, нет — поставьте 0.']
      , ['Сомневаетесь в доходности — ставьте 4,5%', 'Это решаете не вы, а рынок. Ниже — цель больше (надёжнее), выше — цель меньше (рискованнее).']
      , ['Поменяйте несколько раз и посмотрите, что вам дорого', 'Каждое изменение сразу пересчитывает ответ. После десятка попыток вы увидите, какую строку меньше всего хочется урезать.']
    ],
    faqTitle: 'Сумма вышла огромной. И что теперь?',
    faqSub: 'Самые частые вопросы после расчёта.',
    faq: [
      ['Вышло больше десяти миллионов. Всё безнадёжно?', 'Нет. Эта цифра предполагает, что вы никогда не работаете, не трогаете капитал и не теряете покупательную способность — самый строгий вариант. В реальной жизни есть зарплата, страховка, жильё, которое может подорожать, и снижение расходов после выхода на пенсию.']
      , ['Почему на 10 000 ¥ в месяц нужно 4,8 млн ¥?', 'Потому что вы живёте на проценты. При реальной доходности 2,5% сумма 4,8 млн ¥ даёт 120 000 ¥ в год — ровно 10 000 ¥ в месяц, а капитал не уменьшается ни на юань. Это и значит «никогда не кончится».']
      , ['У меня есть жильё. Всё равно вписывать?', 'Нет, поставьте 0. Но коммунальные, ремонт и налог на недвижимость входят в месячные расходы.']
      , ['Доходность 4,5% — это реалистично?', 'Это долгосрочное допущение после инфляции, основанное на реальных результатах организаций вроде Фонда соцстрахования: у частного инвестора после комиссий примерно 4–4,5%. Каждый год так не будет, но для долгосрочного плана это самое разумное допущение.']
      , ['Это число изменится потом?', 'Да. Сменить город, работу, завести ребёнка, болезнь родителя — любое из этого сдвигает цифру. Это показатель здоровья, а не приговор.']
    ],
    fKidsHint: 'Не уверены? Начните с «нет» и посмотрите, как падает сумма. Хотите увидеть цену ребёнка? Выберите одного.',

  }
};

/* ---------------- state ---------------- */
const state = {
  monthly: 15000, kids: 0, childCost: 70, health: 50, house: 0,
  nominal: 4.5, inflation: 2, current: 20,
  mSave: 5000, mGrowth: 3
};

let lang = 'zh';
const t = k => (I18N[lang][k] !== undefined ? I18N[lang][k] : I18N.zh[k]);
const TI = k => I18N[lang][k] || I18N.zh[k] || k;

const RANKS = [
  { max: 150,      c1: '#cfd7e6', c2: '#8892a8', c3: '#5c6577' },
  { max: 300,      c1: '#8ef0d6', c2: '#2bb99a', c3: '#157a66' },
  { max: 600,      c1: '#b3bcff', c2: '#5b6ae0', c3: '#39439c' },
  { max: 1000,     c1: '#f7e0a8', c2: '#cf9c45', c3: '#8a6c2e' },
  { max: 2000,     c1: '#ffc8ae', c2: '#e06a3c', c3: '#963f1d' },
  { max: Infinity, c1: '#e3c7ff', c2: '#9b6bff', c3: '#5c3aa8' }
];

/* ---------------- helpers ---------------- */
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const isCJK = () => lang === 'zh' || lang === 'ko';

function locale() { return { zh: 'zh-CN', en: 'en-US', ko: 'ko-KR', fr: 'fr-FR', ru: 'ru-RU' }[lang]; }

function num(v, dec = 0) {
  return new Intl.NumberFormat(locale(), { minimumFractionDigits: dec, maximumFractionDigits: dec }).format(v);
}

/* split a value in 万元 into {n, u} for display */
function money(wan) {
  if (!isFinite(wan)) return { n: '∞', u: '' };
  const abs = Math.abs(wan);
  if (lang === 'zh') {
    if (abs >= 10000) return { n: num(wan / 10000, 2), u: t('unitYi') };
    if (abs >= 10) return { n: num(wan, 0), u: t('unitWan') };
    return { n: num(wan, 1), u: t('unitWan') };
  }
  const v = wan * 10000;
  if (Math.abs(v) >= 1e8) return { n: num(v / 1e8, 2), u: '×100M' };
  if (Math.abs(v) >= 1e6) return { n: num(v / 1e6, 2), u: 'M' };
  if (Math.abs(v) >= 1e3) return { n: num(v / 1e3, 0), u: 'K' };
  return { n: num(v, 0), u: '' };
}
const moneyStr = wan => {
  if (!isFinite(wan)) return '∞';
  const m = money(wan);
  return `¥${m.n}${m.u ? (lang === 'zh' ? '' : ' ') + m.u : ''}`;
};

/* ---------------- calc ---------------- */
function calc() {
  const real = state.nominal - state.inflation;
  const mult = real > 0.01 ? 12 / (real / 100) : Infinity;
  const core = mult === Infinity ? Infinity : mult * state.monthly / 10000;
  const kidsC = state.childCost * state.kids;
  const total = core + kidsC + state.health + state.house;
  return { real, mult, core, kidsC, total };
}

/* ---------------- i18n apply ---------------- */
function applyI18n() {
  document.documentElement.lang = lang;
  $$('[data-i18n]').forEach(el => {
    const k = el.dataset.i18n;
    if (I18N[lang][k] !== undefined) el.textContent = I18N[lang][k];
  });
  document.title = lang === 'zh'
    ? '财富自由计算器 · 你需要多少钱才能财富自由？'
    : `${t('brand')} · Freedom Number`;

  // chips
  const wrap = $('#chipsMonthly');
  const vals = [3000, 6000, 10000, 15000, 25000];
  wrap.innerHTML = '';
  vals.forEach((v, i) => {
    const b = document.createElement('button');
    b.className = 'chip' + (state.monthly === v ? ' on' : '');
    b.textContent = t('chips')[i];
    b.onclick = () => { setField('monthly', v); };
    wrap.appendChild(b);
  });

  renderStatic();
  $('#totalUnit').textContent = money(calc().total).u;
  renderAll();
}

/* ---------------- binding ---------------- */
const linkMap = [
  ['monthly', 'monthlyR'], ['childCost', 'childCostR'],
  ['health', 'healthR'], ['house', 'houseR'],
  ['nominal', 'nominalR'], ['inflation', 'inflationR']
];

function setRangeFill(el) {
  const p = (el.value - el.min) / (el.max - el.min) * 100;
  el.style.setProperty('--p', p + '%');
}

function setField(key, val) {
  state[key] = val;
  const numEl = document.getElementById(key);
  const rEl = document.getElementById(key + 'R');
  if (numEl && Number(numEl.value) !== val) numEl.value = val;
  if (rEl) { rEl.value = clamp(val, rEl.min, rEl.max); setRangeFill(rEl); }
  syncKidsSeg();
  renderAll();
}

function syncKidsSeg() {
  $$('#kidsSeg button').forEach(b => b.classList.toggle('on', Number(b.dataset.kids) === state.kids));
}

function bindInputs() {
  linkMap.forEach(([n, r]) => {
    const numEl = document.getElementById(n);
    const rEl = document.getElementById(r);
    setRangeFill(rEl);

    numEl.addEventListener('input', () => {
      let v = parseFloat(numEl.value);
      if (isNaN(v)) return;
      state[n] = clamp(v, parseFloat(numEl.min), parseFloat(numEl.max));
      const rv = clamp(state[n], rEl.min, rEl.max);
      rEl.value = rv; setRangeFill(rEl);
      renderAll();
    });
    numEl.addEventListener('blur', () => {
      let v = parseFloat(numEl.value);
      if (isNaN(v)) v = parseFloat(numEl.min);
      v = clamp(v, parseFloat(numEl.min), parseFloat(numEl.max));
      numEl.value = v; state[n] = v;
      renderAll();
    });

    rEl.addEventListener('input', () => {
      state[n] = parseFloat(rEl.value);
      numEl.value = state[n];
      setRangeFill(rEl);
      renderAll();
    });
  });

  $('#kidsSeg').addEventListener('click', e => {
    const b = e.target.closest('button[data-kids]');
    if (!b) return;
    state.kids = Number(b.dataset.kids);
    syncKidsSeg(); renderAll();
  });

  $('#current').addEventListener('input', e => {
    let v = parseFloat(e.target.value);
    state.current = isNaN(v) ? 0 : clamp(v, 0, 99999);
    renderAll();
  });
  $('#current').addEventListener('blur', e => { e.target.value = state.current; });

  // info toggles
  $$('.info-btn').forEach(b => {
    b.onclick = () => {
      const key = b.dataset.more;
      const box = document.querySelector(`[data-more-for="${key}"]`);
      const open = box.classList.toggle('open');
      b.classList.toggle('on', open);
    };
  });

  // language
  $('#lang').addEventListener('click', e => {
    const b = e.target.closest('button[data-lang]');
    if (!b) return;
    lang = b.dataset.lang;
    $$('#lang button').forEach(x => x.classList.toggle('on', x === b));
    movePill();
    applyI18n();
    if ($('#modal').classList.contains('open')) {
      renderBadge();
      renderChart();
    }
  });

  // modal
  $('#mintBtn').onclick = openModal;
  $('#modalClose').onclick = closeModal;
  $('.modal-bg').onclick = closeModal;
  $$('.modal-tabs button').forEach(b => {
    b.onclick = () => {
      $$('.modal-tabs button').forEach(x => x.classList.toggle('on', x === b));
      $$('.tab-pane').forEach(p => p.classList.toggle('on', p.id === 'pane' + b.dataset.tab.charAt(0).toUpperCase() + b.dataset.tab.slice(1)));
      if (b.dataset.tab === 'plan') renderChart();
    };
  });

  $('#mSave').addEventListener('input', e => { state.mSave = clamp(parseFloat(e.target.value) || 0, 0, 200000); renderChart(); });
  $('#mGrowth').addEventListener('input', e => { state.mGrowth = clamp(parseFloat(e.target.value) || 0, 0, 20); renderChart(); });

  // mini bar
  $('#mbBtn').onclick = openModal;
  const resEl = $('#result');
  const barEl = $('#miniBar');
  const syncBar = () => {
    if (window.innerWidth > 980) { barEl.classList.remove('show'); return; }
    const rc = resEl.getBoundingClientRect();
    barEl.classList.toggle('show', rc.bottom < 40);
  };
  window.addEventListener('scroll', syncBar, { passive: true });
  window.addEventListener('resize', syncBar);

  $('#saveBtn').onclick = saveImage;
  $('#shareBtn').onclick = shareImage;

}

/* pill position */
function movePill() {
  const active = $('#lang button.on');
  const pill = $('.lang-pill');
  if (!active || !pill) return;
  const p = active.parentElement.getBoundingClientRect();
  const r = active.getBoundingClientRect();
  pill.style.width = r.width + 'px';
  pill.style.transform = `translateX(${r.left - p.left - 4}px)`;
}

/* ---------------- render ---------------- */
let displayTotal = 0;
let rafId = null;

function animateTotal(target) {
  const start = displayTotal;
  const dur = 620;
  const t0 = performance.now();
  cancelAnimationFrame(rafId);
  const step = now => {
    const p = Math.min(1, (now - t0) / dur);
    const e = 1 - Math.pow(1 - p, 3);
    displayTotal = start + (target - start) * e;
    paintTotal(displayTotal);
    if (p < 1) rafId = requestAnimationFrame(step);
  };
  rafId = requestAnimationFrame(step);
}

function paintTotal(v) {
  const m = money(v);
  $('#totalNum').textContent = m.n;
  $('#totalUnit').textContent = m.u;
}

function renderAll() {
  const r = calc();

  // hero multiplier
  const hm = $('#heroMult');
  hm.textContent = r.mult === Infinity ? '∞' : num(Math.round(r.mult), 0);

  // multiplier / real rate
  $('#realRate').textContent = num(r.real, 1) + '%';
  $('#multiplier').textContent = r.mult === Infinity ? '∞' : num(Math.round(r.mult), 0);

  // total
  animateTotal(r.total);

  // progress bar
  const pct = r.total > 0 && isFinite(r.total) ? clamp(state.current / r.total, 0, 1) : 0;
  const fill = $('#pbarFill');
  if (fill) {
    fill.style.width = (pct * 100) + '%';
    fill.style.background = pct >= 1
      ? 'linear-gradient(90deg,#00c2a8,#38a8ff)'
      : 'linear-gradient(90deg,#6474ff,#00c2a8)';
  }

  // gap
  const gap = r.total - state.current;
  $('#gapTxt').textContent = gap > 0
    ? t('gapNeed').replace('{x}', moneyStr(gap))
    : t('gapDone');

  // breakdown
  [['Core', r.core], ['Kids', r.kidsC], ['Health', state.health], ['House', state.house]].forEach(([k, v]) => {
    const el = $('#bk' + k);
    if (!el) return;
    el.textContent = (v > 0 && isFinite(v)) ? moneyStr(v) : '—';
    el.closest('.bk-row').classList.toggle('dim', !(v > 0));
  });

  // insight
  let ins = '';
  if (!isFinite(r.total)) {
    ins = t('insInvalid');
  } else if (gap <= 0) {
    ins = t('insDone').replace('{x}', moneyStr(state.monthly));
  } else if (state.house > 0 && state.house / r.total > 0.35) {
    ins = t('insHouse').replace('{p}', Math.round(state.house / r.total * 100));
  } else if (r.core / r.total > 0.7) {
    ins = t('insCore').replace('{p}', Math.round(r.core / r.total * 100));
  } else {
    ins = t('insGap')
      .replace('{g}', moneyStr(gap))
      .replace('{s}', moneyStr(state.mSave / 10000));
  }
  $('#insight').textContent = ins;

  // mini bar (mobile)
  const mb = $('#mbNum');
  if (mb) mb.textContent = moneyStr(r.total);

  // chips active
  $$('#chipsMonthly .chip').forEach((c, i) => {
    c.classList.toggle('on', [3000, 6000, 10000, 15000, 25000][i] === state.monthly);
  });
}

/* ---------------- static sections ---------------- */
const EXP_ICONS = [
  '<svg viewBox="0 0 24 24" fill="none"><path d="M4 19V9m5 10V5m5 14v-7m5 7V8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none"><path d="M12 3v18M7 7.5h7.5a2.8 2.8 0 0 1 0 5.6h-5a2.8 2.8 0 0 0 0 5.6H17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none"><path d="M3 17l5-6 4 3.5L21 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 5h5v5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none"><path d="M12 21s-7-4.5-7-10a7 7 0 0 1 14 0c0 5.5-7 10-7 10z" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="10.5" r="2.4" stroke="currentColor" stroke-width="2"/></svg>'
];

function renderStatic() {
  // 公式解释卡
  const grid = $('#expGrid');
  if (grid) {
    grid.innerHTML = ['exp1T', 'exp2T', 'exp3T', 'exp4T'].map((tk, i) => `
      <article class="exp-card">
        <div class="exp-ico i${i + 1}">${EXP_ICONS[i]}</div>
        <h4>${t(tk)}</h4>
        <p>${t('exp' + (i + 1) + 'B')}</p>
      </article>`).join('');
  }

  // 计算手册
  const gl = $('#guideList');
  if (gl) {
    const items = t('guide') || [];
    gl.innerHTML = items.map((it, i) => `
      <div class="guide-item">
        <span class="gi-num">${i + 1}</span>
        <div class="gi-body">
          <h4>${it[0]}</h4>
          <p>${it[1]}</p>
        </div>
      </div>`).join('');
  }

  // 常见问题
  const fl = $('#faqList');
  if (fl) {
    const items = t('faq') || [];
    fl.innerHTML = items.map((it, i) => `
      <div class="faq-item">
        <div class="faq-q"><i>Q${i + 1}</i><span>${it[0]}</span></div>
        <p class="faq-a">${it[1]}</p>
      </div>`).join('');
  }
}

/* ---------------- badge ---------------- */
function rankIndex(total) {
  for (let i = 0; i < RANKS.length; i++) if (total < RANKS[i].max) return i;
  return RANKS.length - 1;
}

function serial(total) {
  let h = 0;
  const s = Math.round(total * 100) + '|' + state.monthly + '|' + lang;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 99991;
  return 'FN-' + String(h).padStart(5, '0');
}

function dateStr() {
  const d = new Date();
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function badgeSVG(total, size) {
  const ri = rankIndex(total);
  const rk = RANKS[ri];
  const m = money(total);
  const rankName = t('ranks')[ri];
  const sn = serial(total);
  const amtFont = m.n.length > 6 ? 38 : m.n.length > 4 ? 46 : 54;
  const capTxt = t('amountCap');
  const capFont = capTxt.length > 14 ? 8.2 : capTxt.length > 9 ? 9.8 : 13;
  const capLs = capTxt.length > 14 ? 1.6 : 2.6;
  const id = 'bg' + ri + lang;

  // 72 ticks around the rim
  let ticks = '';
  for (let i = 0; i < 72; i++) {
    const a = (i / 72) * Math.PI * 2 - Math.PI / 2;
    const long = i % 6 === 0;
    const r1 = long ? 133 : 137, r2 = 143;
    const x1 = 160 + Math.cos(a) * r1, y1 = 160 + Math.sin(a) * r1;
    const x2 = 160 + Math.cos(a) * r2, y2 = 160 + Math.sin(a) * r2;
    ticks += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${long ? rk.c2 : 'rgba(22,32,58,.22)'}" stroke-width="${long ? 1.4 : .7}" opacity="${long ? .9 : .5}" stroke-linecap="round"/>`;
  }

  // small diamonds between ticks
  let stars = '';
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + Math.PI / 12;
    const x = 160 + Math.cos(a) * 128, y = 160 + Math.sin(a) * 128;
    const s2 = i % 3 === 0 ? 2.8 : 1.5;
    stars += `<path d="M${x.toFixed(1)} ${(y - s2).toFixed(1)}L${(x + s2 * .34).toFixed(1)} ${(y - s2 * .34).toFixed(1)}L${(x + s2).toFixed(1)} ${y.toFixed(1)}L${(x + s2 * .34).toFixed(1)} ${(y + s2 * .34).toFixed(1)}L${x.toFixed(1)} ${(y + s2).toFixed(1)}L${(x - s2 * .34).toFixed(1)} ${(y + s2 * .34).toFixed(1)}L${(x - s2).toFixed(1)} ${y.toFixed(1)}L${(x - s2 * .34).toFixed(1)} ${(y - s2 * .34).toFixed(1)}Z" fill="${rk.c2}" opacity="${i % 3 === 0 ? .85 : .35}"/>`;
  }

  return `
<svg viewBox="0 0 320 320" width="${size || 340}" xmlns="http://www.w3.org/2000/svg" font-family="Inter,system-ui,-apple-system,sans-serif">
  <defs>
    <radialGradient id="${id}t" cx="50%" cy="30%" r="72%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="62%" stop-color="#ffffff" stop-opacity=".92"/>
      <stop offset="100%" stop-color="${rk.c1}" stop-opacity=".42"/>
    </radialGradient>
    <linearGradient id="${id}rim" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${rk.c1}"/>
      <stop offset="45%" stop-color="${rk.c2}"/>
      <stop offset="100%" stop-color="${rk.c3}"/>
    </linearGradient>
    <linearGradient id="${id}txt" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1b2542"/>
      <stop offset="100%" stop-color="${rk.c3}"/>
    </linearGradient>
    <filter id="${id}sh" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="${rk.c2}" flood-opacity=".28"/>
    </filter>
  </defs>

  <circle cx="160" cy="160" r="152" fill="none" stroke="${rk.c2}" stroke-opacity=".18" stroke-width="1"/>

  <g class="spin">${ticks}</g>
  <g class="spin-r">${stars}</g>

  <g filter="url(#${id}sh)">
    <circle cx="160" cy="160" r="122" fill="url(#${id}t)"/>
    <circle cx="160" cy="160" r="122" fill="none" stroke="url(#${id}rim)" stroke-width="2"/>
  </g>
  <circle cx="160" cy="160" r="111" fill="none" stroke="${rk.c2}" stroke-opacity=".35" stroke-width=".8" stroke-dasharray="1.5 4.5"/>

  <!-- rank -->
  <text x="160" y="80" text-anchor="middle" font-size="10.5" font-weight="700" letter-spacing="3.4" fill="${rk.c3}">${rankName.toUpperCase()}</text>
  <path d="M124 90h16M180 90h16" stroke="${rk.c2}" stroke-opacity=".6" stroke-width="1" stroke-linecap="round"/>
  <path d="M160 86.6l1.5 2.4-1.5 2.4-1.5-2.4z" fill="${rk.c2}"/>

  <!-- amount -->
  <text x="160" y="120" text-anchor="middle" font-size="13" font-weight="600" fill="${rk.c3}" opacity=".8">¥</text>
  <text x="160" y="172" text-anchor="middle" font-size="${amtFont}" font-weight="800" fill="url(#${id}txt)" letter-spacing="-2">${m.n}</text>
  <text x="160" y="192" text-anchor="middle" font-size="11" font-weight="600" letter-spacing="1.4" fill="${rk.c3}" opacity=".75">${m.u}</text>

  <!-- caption -->
  <text x="160" y="222" text-anchor="middle" font-size="${capFont}" font-weight="800" letter-spacing="${capLs}" fill="${rk.c2}">${capTxt}</text>

  <!-- meta -->
  <line x1="128" y1="238" x2="192" y2="238" stroke="${rk.c2}" stroke-opacity=".35" stroke-width=".9"/>
  <text x="160" y="255" text-anchor="middle" font-size="7.6" letter-spacing=".9" fill="rgba(22,32,58,.42)">${sn}　·　${dateStr()}</text>
</svg>`;
}

function renderBadge() {
  const r = calc();
  $('#badgeStage').innerHTML = badgeSVG(r.total, 340);
  const m = money(r.total);
  $('#badgeLine').textContent = isFinite(r.total)
    ? t('badgeLine').replace('{n}', `${m.n} ${m.u}`.trim())
    : t('insInvalid');
}

/* ---------------- plan / chart ---------------- */
function planData() {
  const r = calc();
  const target = r.total;
  const realPct = Math.max(r.real, 0.1);
  let v = state.current, year = 0, invested = state.current;
  const series = [{ y: 0, v }];
  let save = state.mSave / 10000;

  if (v >= target) return { series, years: 0, invested: 0, gain: 0, target, reached: true, already: true };

  for (let i = 0; i < 60; i++) {
    v = v * (1 + realPct / 100) + save * 12;
    invested += save * 12;
    year++;
    series.push({ y: year, v });
    save *= (1 + state.mGrowth / 100);
    if (v >= target) break;
  }
  return { series, years: year, invested, gain: v - invested, target, reached: v >= target, already: false, end: v };
}

/* how much must be saved monthly to reach target within N years */
function solveMonthly(years, target) {
  const realPct = Math.max(calc().real, 0.1);
  const sim = m => {
    let v = state.current, save = m;
    for (let i = 0; i < years; i++) { v = v * (1 + realPct / 100) + save * 12; save *= (1 + state.mGrowth / 100); }
    return v;
  };
  let lo = 0, hi = 300;
  for (let i = 0; i < 46; i++) {
    const mid = (lo + hi) / 2;
    if (sim(mid) < target) lo = mid; else hi = mid;
  }
  return hi * 10000;
}

function renderChart() {
  const d = planData();
  if (!isFinite(d.target)) {
    $('#chart').innerHTML = `<div style="padding:44px 10px;text-align:center;color:rgba(22,32,58,.55);font-size:14px;line-height:1.7">${t('insInvalid')}</div>`;
    $('#planKpi').innerHTML = '';
    return;
  }
  const W = 460, H = 230, pl = 46, pr = 12, pt = 16, pb = 30;
  const maxY = Math.max(d.target, ...d.series.map(p => p.v)) * 1.08;
  const n = Math.max(d.series.length - 1, 1);
  const X = y => pl + (y / n) * (W - pl - pr);
  const Y = v => H - pb - (v / maxY) * (H - pt - pb);

  let line = '';
  d.series.forEach((p, i) => {
    line += (i === 0 ? `M${X(p.y).toFixed(1)} ${Y(p.v).toFixed(1)}` : ` L${X(p.y).toFixed(1)} ${Y(p.v).toFixed(1)}`);
  });
  const area = line + ` L${X(n).toFixed(1)} ${H - pb} L${pl} ${H - pb} Z`;

  const ty = Y(d.target);
  const hit = d.reached && !d.already ? d.series.find(p => p.v >= d.target) : null;

  let grid = '';
  [0, .25, .5, .75, 1].forEach(f => {
    const v = maxY * f, y = Y(v);
    grid += `<line x1="${pl}" y1="${y.toFixed(1)}" x2="${W - pr}" y2="${y.toFixed(1)}" stroke="rgba(22,32,58,.07)" stroke-width="1"/>`;
    const mm = money(v);
    const lbl = f === 0 ? '0' : mm.n + mm.u;
    grid += `<text x="${pl - 8}" y="${(y - 4).toFixed(1)}" text-anchor="end" font-size="8.5" fill="rgba(22,32,58,.48)" font-family="Inter,sans-serif">${lbl}</text>`;
  });

  let xl = '';
  const steps = Math.min(5, n);
  for (let i = 0; i <= steps; i++) {
    const yr = Math.round(n / steps * i);
    xl += `<text x="${X(yr).toFixed(1)}" y="${H - 9}" text-anchor="middle" font-size="8.5" fill="rgba(22,32,58,.5)" font-family="Inter,sans-serif">${yr}${t('yearUnit')}</text>`;
  }

  const mark = hit
    ? `<circle cx="${X(hit.y).toFixed(1)}" cy="${Y(hit.v).toFixed(1)}" r="4.5" fill="#fff" stroke="${RANKS[rankIndex(d.target)].c2}" stroke-width="2"/>
       <circle cx="${X(hit.y).toFixed(1)}" cy="${Y(hit.v).toFixed(1)}" r="9" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="1">
         <animate attributeName="r" values="5;15;5" dur="2.8s" repeatCount="indefinite"/>
         <animate attributeName="stroke-opacity" values=".4;0;.4" dur="2.8s" repeatCount="indefinite"/>
       </circle>` : '';

  $('#chart').innerHTML = `
  <svg viewBox="0 0 ${W} ${H}">
    <defs>
      <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#5b6cff" stop-opacity=".22"/>
        <stop offset="100%" stop-color="#5b6cff" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="lg" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#6474ff"/>
        <stop offset="55%" stop-color="#8b5cf6"/>
        <stop offset="100%" stop-color="#a855c7"/>
      </linearGradient>
    </defs>
    ${grid}
    <line x1="${pl}" y1="${ty.toFixed(1)}" x2="${W - pr}" y2="${ty.toFixed(1)}" stroke="rgba(22,32,58,.3)" stroke-width="1.4" stroke-dasharray="5 5"/>
    <text x="${W - pr}" y="${(ty - 6).toFixed(1)}" text-anchor="end" font-size="8.5" fill="rgba(22,32,58,.55)" font-weight="600" font-family="Inter,sans-serif">${moneyStr(d.target)}</text>
    <path d="${area}" fill="url(#ag)"/>
    <path d="${line}" fill="none" stroke="url(#lg)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"
      stroke-dasharray="4000" stroke-dashoffset="4000">
      <animate attributeName="stroke-dashoffset" from="4000" to="0" dur="1.5s" fill="freeze" calcMode="spline" keySplines=".22 .68 0 1" keyTimes="0;1"/>
    </path>
    ${mark}
    ${xl}
  </svg>`;

  let kpi;
  if (d.already) {
    kpi = `<div class="kpi"><b>${t('ringCap')}</b><span>${t('lgTarget')} · ${moneyStr(d.target)}</span></div>
       <div class="kpi"><b>${moneyStr(state.current)}</b><span>${t('lgAsset')}</span></div>
       <div class="kpi"><b>0</b><span>${t('kpiYears')}</span></div>`;
  } else if (d.reached) {
    kpi = `<div class="kpi"><b>${d.years}<small>${t('yearUnit')}</small></b><span>${t('kpiYears')}</span></div>
       <div class="kpi"><b>${moneyStr(d.invested)}</b><span>${t('kpiInvest')}</span></div>
       <div class="kpi"><b>${moneyStr(Math.max(d.gain, 0))}</b><span>${t('kpiGain')}</span></div>`;
  } else {
    const need = solveMonthly(30, d.target);
    kpi = `<div class="kpi"><b>${moneyStr(need / 10000)}</b><span>${t('kpiNeed30')}</span></div>
       <div class="kpi"><b>${moneyStr(d.invested)}</b><span>${t('kpiInvest60')}</span></div>
       <div class="kpi"><b>${moneyStr(d.end)}</b><span>${t('kpiEnd60')}</span></div>`;
  }
  $('#planKpi').innerHTML = kpi;
}

/* ---------------- modal ---------------- */
function openModal() {
  const modal = $('#modal');
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  // reset to badge tab
  $$('.modal-tabs button').forEach((x, i) => x.classList.toggle('on', i === 0));
  $$('.tab-pane').forEach((p, i) => p.classList.toggle('on', i === 0));
  renderBadge();
  renderChart();
}
function closeModal() {
  $('#modal').classList.remove('open');
  $('#modal').setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* ---------------- share image (canvas) ---------------- */
function drawShareCanvas() {
  const W = 1080, H = 1440;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');
  const r = calc();
  const ri = rankIndex(r.total), rk = RANKS[ri];
  const m = money(r.total);
  const sn = serial(r.total);

  /* ---------- background ---------- */
  const bg = ctx.createLinearGradient(0, 0, W * .3, H);
  bg.addColorStop(0, '#f9fbff');
  bg.addColorStop(.45, '#f0f4ff');
  bg.addColorStop(.75, '#f7f3ff');
  bg.addColorStop(1, '#f2f8ff');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  const halo = ctx.createRadialGradient(W / 2, 470, 60, W / 2, 470, 720);
  halo.addColorStop(0, rk.c1 + '66');
  halo.addColorStop(.6, rk.c2 + '18');
  halo.addColorStop(1, 'transparent');
  ctx.fillStyle = halo; ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = 'rgba(91,108,255,.07)';
  ctx.lineWidth = 1.5;
  for (let x = 0; x <= W; x += 80) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y <= H; y += 80) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

  /* ---------- brand ---------- */
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(22,32,58,.82)';
  ctx.font = '700 26px Inter, "PingFang SC", sans-serif';
  ctx.fillText(t('brand'), 80, 96);
  ctx.fillStyle = 'rgba(22,32,58,.34)';
  ctx.font = '500 15px Inter, sans-serif';
  ctx.letterSpacing = '5px';
  ctx.fillText('FREEDOM NUMBER', 80, 126);
  ctx.letterSpacing = '0px';

  ctx.beginPath(); ctx.arc(W - 100, 100, 30, 0, 7);
  ctx.strokeStyle = rk.c2 + '66'; ctx.lineWidth = 2; ctx.stroke();
  ctx.textAlign = 'center';
  ctx.fillStyle = rk.c2;
  ctx.font = '700 26px Inter, sans-serif';
  ctx.fillText('¥', W - 100, 110);

  /* ---------- badge ---------- */
  const cx = W / 2, cy = 520, R = 210;
  ctx.save();
  ctx.translate(cx, cy);

  const gl = ctx.createRadialGradient(0, 0, R * .2, 0, 0, R * 1.62);
  gl.addColorStop(0, rk.c1 + '30');
  gl.addColorStop(.55, rk.c1 + '14');
  gl.addColorStop(1, rk.c1 + '00');
  ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(0, 0, R * 1.62, 0, 7); ctx.fill();

  for (let i = 0; i < 72; i++) {
    const a = (i / 72) * Math.PI * 2 - Math.PI / 2;
    const long = i % 6 === 0;
    const r1 = long ? R + 14 : R + 19, r2 = R + 30;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * r1, Math.sin(a) * r1);
    ctx.lineTo(Math.cos(a) * r2, Math.sin(a) * r2);
    ctx.strokeStyle = long ? rk.c2 : 'rgba(22,32,58,.2)';
    ctx.globalAlpha = long ? .85 : .45;
    ctx.lineWidth = long ? 2.2 : 1.1;
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + Math.PI / 12;
    const x = Math.cos(a) * (R + 8), y = Math.sin(a) * (R + 8);
    const s2 = i % 3 === 0 ? 4.2 : 2.4;
    ctx.beginPath();
    ctx.moveTo(x, y - s2); ctx.lineTo(x + s2 * .35, y - s2 * .35);
    ctx.lineTo(x + s2, y); ctx.lineTo(x + s2 * .35, y + s2 * .35);
    ctx.lineTo(x, y + s2); ctx.lineTo(x - s2 * .35, y + s2 * .35);
    ctx.lineTo(x - s2, y); ctx.lineTo(x - s2 * .35, y - s2 * .35);
    ctx.closePath();
    ctx.fillStyle = rk.c2; ctx.globalAlpha = i % 3 === 0 ? .8 : .3; ctx.fill();
  }
  ctx.globalAlpha = 1;

  // disc
  ctx.save();
  ctx.shadowColor = rk.c2 + '2e';
  ctx.shadowBlur = 26;
  ctx.shadowOffsetY = 10;
  const disc = ctx.createRadialGradient(0, -R * .4, 10, 0, 0, R);
  disc.addColorStop(0, '#ffffff');
  disc.addColorStop(.62, '#ffffff');
  disc.addColorStop(1, rk.c1);
  ctx.beginPath(); ctx.arc(0, 0, R, 0, 7);
  ctx.fillStyle = disc; ctx.fill();
  ctx.restore();

  ctx.beginPath(); ctx.arc(0, 0, R, 0, 7);
  ctx.strokeStyle = rk.c2; ctx.lineWidth = 2; ctx.stroke();

  ctx.beginPath(); ctx.arc(0, 0, R - 20, 0, 7);
  ctx.setLineDash([4, 9]); ctx.strokeStyle = rk.c2 + '5c'; ctx.lineWidth = 1.3; ctx.stroke();
  ctx.setLineDash([]);

  // rank
  ctx.textAlign = 'center';
  ctx.fillStyle = rk.c3;
  ctx.font = '700 24px Inter, "PingFang SC", sans-serif';
  ctx.letterSpacing = '9px';
  ctx.fillText(t('ranks')[ri].toUpperCase(), 0, -134);
  ctx.letterSpacing = '0px';

  ctx.beginPath(); ctx.moveTo(-60, -114); ctx.lineTo(60, -114);
  ctx.strokeStyle = rk.c2 + '77'; ctx.lineWidth = 1.3; ctx.stroke();

  // amount
  ctx.fillStyle = rk.c3;
  ctx.globalAlpha = .8;
  ctx.font = '600 34px Inter, sans-serif';
  ctx.fillText('¥', 0, -58);
  ctx.globalAlpha = 1;

  const grad = ctx.createLinearGradient(0, -10, 0, 96);
  grad.addColorStop(0, '#1b2542');
  grad.addColorStop(1, rk.c3);
  ctx.fillStyle = grad;
  const fs = m.n.length > 6 ? 78 : m.n.length > 4 ? 96 : 112;
  ctx.font = `800 ${fs}px Inter, "PingFang SC", sans-serif`;
  ctx.fillText(m.n, 0, 54);

  ctx.fillStyle = rk.c3 + 'cc';
  ctx.font = '600 27px Inter, sans-serif';
  ctx.fillText(m.u, 0, 92);

  ctx.fillStyle = rk.c2;
  const capTxt = t('amountCap');
  const capFs = capTxt.length > 14 ? 19 : capTxt.length > 9 ? 22 : 27;
  ctx.font = `800 ${capFs}px Inter, "PingFang SC", sans-serif`;
  ctx.letterSpacing = capTxt.length > 14 ? '2px' : '5px';
  ctx.fillText(capTxt, 0, 134);
  ctx.letterSpacing = '0px';

  ctx.beginPath(); ctx.moveTo(-58, 154); ctx.lineTo(58, 154);
  ctx.strokeStyle = rk.c2 + '55'; ctx.lineWidth = 1.2; ctx.stroke();

  ctx.fillStyle = 'rgba(22,32,58,.42)';
  ctx.font = '500 16px Inter, sans-serif';
  ctx.fillText(`${sn}   ·   ${dateStr()}`, 0, 176);

  ctx.restore();

  /* ---------- breakdown ---------- */
  const bx = 90, bw = W - 180;
  let by = 892;

  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(22,32,58,.4)';
  ctx.font = '700 16px Inter, "PingFang SC", sans-serif';
  ctx.letterSpacing = '4px';
  ctx.fillText(t('resBreak').toUpperCase(), bx, by);
  ctx.letterSpacing = '0px';

  by += 52;
  const rows = [
    [t('bkCore'), moneyStr(r.core), rk.c2],
    [t('bkKids'), r.kidsC > 0 ? moneyStr(r.kidsC) : '—', '#14b8a6'],
    [t('bkHealth'), state.health > 0 ? moneyStr(state.health) : '—', '#8b5cf6'],
    [t('bkHouse'), state.house > 0 ? moneyStr(state.house) : '—', '#f97316']
  ];
  rows.forEach(([k, v, color]) => {
    ctx.beginPath(); ctx.arc(bx + 6, by - 9, 5.5, 0, 7);
    ctx.fillStyle = color; ctx.fill();

    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(22,32,58,.62)';
    ctx.font = '500 24px Inter, "PingFang SC", sans-serif';
    ctx.fillText(k, bx + 28, by);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#16203a';
    ctx.font = '700 24px Inter, sans-serif';
    ctx.fillText(v, bx + bw, by);

    ctx.beginPath(); ctx.moveTo(bx, by + 22); ctx.lineTo(bx + bw, by + 22);
    ctx.strokeStyle = 'rgba(22,32,58,.08)'; ctx.lineWidth = 1.2; ctx.stroke();
    by += 62;
  });

  ctx.textAlign = 'left';
  ctx.fillStyle = rk.c3;
  ctx.font = '700 22px Inter, "PingFang SC", sans-serif';
  const note = `×${r.mult === Infinity ? '∞' : Math.round(r.mult)}   ·   X = ¥${num(state.monthly)}`;
  ctx.fillText(note, bx, by + 30);

  /* ---------- footer ---------- */
  ctx.beginPath(); ctx.moveTo(bx, H - 130); ctx.lineTo(bx + bw, H - 130);
  ctx.strokeStyle = 'rgba(22,32,58,.1)'; ctx.lineWidth = 1.2; ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(22,32,58,.55)';
  ctx.font = '600 24px Inter, "PingFang SC", sans-serif';
  ctx.fillText(t('heroLine1') + '  ' + t('heroLine2'), W / 2, H - 82);

  ctx.fillStyle = 'rgba(22,32,58,.26)';
  ctx.font = '500 15px Inter, sans-serif';
  ctx.letterSpacing = '4px';
  ctx.fillText('FREEDOM NUMBER', W / 2, H - 48);
  ctx.letterSpacing = '0px';

  return cv;
}

function downloadCanvas(cv, name) {
  cv.toBlob(blob => {
    if (!blob) return toast(t('toastFail'));
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    toast(t('toastSaved'));
  }, 'image/png');
}

function saveImage() {
  downloadCanvas(drawShareCanvas(), `freedom-number-${serial(calc().total)}.png`);
}

async function shareImage() {
  const cv = drawShareCanvas();
  const r = calc();
  const text = t('shareText').replace('{x}', moneyStr(r.total));
  cv.toBlob(async blob => {
    if (!blob) return saveImage();
    const file = new File([blob], 'freedom-number.png', { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], text, title: t('brand') });
        return;
      } catch (e) { /* user cancelled */ }
    }
    // fallback: clipboard
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      toast(t('toastCopied'));
    } catch (e) {
      saveImage();
    }
  }, 'image/png');
}

/* ---------------- toast ---------------- */
let toastTimer;
function toast(msg) {
  let el = $('.toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  requestAnimationFrame(() => el.classList.add('show'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
}

/* ---------------- reveal ---------------- */
function initReveal() {
  const io = new IntersectionObserver(entries => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('in'), i * 60);
        io.unobserve(e.target);
      }
    });
  }, { threshold: .12, rootMargin: '0px 0px -40px' });
  $$('.reveal').forEach(el => io.observe(el));
}

/* ---------------- init ---------------- */
document.addEventListener('DOMContentLoaded', () => {
  bindInputs();
  applyI18n();
  movePill();

  // ?fast=1 — disable entrance animations (used for static screenshots/testing)
  if (/(\?|&)fast=1/.test(location.search)) {
    document.documentElement.classList.add('no-anim');
    $$('.reveal').forEach(el => el.classList.add('in'));
  } else {
    initReveal();
  }

  window.addEventListener('resize', movePill);
  setTimeout(movePill, 300);
});
