// 凌烟阁密档 - 事件库（从 Web V3.0 同步）

module.exports = [
        // ==================== 贞观初年（627-629）====================
        {
          id: 1, stage: 'early', storyline: null, historicalYear: '627', title: '玄武门余波',
          desc: '玄武门之变刚过不久，宗室中仍有人对你得位不正心存疑虑，暗中串联。',
          options: [
            { text: '大加封赏宗室，以示宽仁', effects: { changsun: 10, yuchi: -5, weizheng: -10, fangxuanling: -5, stability: -5 }, feedback: '宗室暂时安稳，但国库支出增加，魏征认为你在收买人心。' },
            { text: '严惩心怀不满者，震慑宗室', effects: { yuchi: 15, changsun: -5, weizheng: 10, fangxuanling: 5, stability: 5 }, feedback: '朝野震慑，宗室不敢再言，但人心惶惶。' },
            { text: '让房玄龄出面安抚，转移矛盾', effects: { fangxuanling: 15, changsun: 5, weizheng: 5, yuchi: -5, stability: 5 }, feedback: '房玄龄以制度换人心，宗室情绪渐平。' }
          ]
        },
        {
          id: 2, stage: 'early', storyline: null, historicalYear: '627', title: '释放宫女',
          desc: '你下令释放宫中数千宫女，让她们归家婚配。长孙无忌认为此举有损皇家体面，魏征则大加赞赏。',
          options: [
            { text: '坚持释放，彰显仁德', effects: { weizheng: 20, fangxuanling: 10, changsun: -10, yuchi: -5, stability: 10 }, feedback: '民间称颂，后宫开支大减。' },
            { text: '只释放年老者，其余留用', effects: { changsun: 10, weizheng: -5, fangxuanling: -5 }, feedback: '各方都不甚满意，但亦无大波澜。' },
            { text: '收回成命，维持旧制', effects: { changsun: 15, weizheng: -20, fangxuanling: -10, stability: -10 }, feedback: '魏征当众叹息，清流士气受挫。' }
          ]
        },
        {
          id: 3, stage: 'early', storyline: 'reform', historicalYear: '627', title: '房玄龄献租庸调法',
          desc: '房玄龄呈上新的赋税制度，主张均田、租庸调并举，以求国用充足。',
          options: [
            { text: '全面推行', effects: { fangxuanling: 25, weizheng: 10, changsun: -10, yuchi: -10, stability: 5 }, feedback: '国库收入渐稳，但旧族与军户一时难以适应。' },
            { text: '暂缓施行', effects: { fangxuanling: -15, weizheng: -5, changsun: 5, yuchi: 5 }, feedback: '房玄龄失望退下，各方势力暂时相安。' },
            { text: '选三州试点', effects: { fangxuanling: 15, weizheng: 5, changsun: 5, yuchi: 5 }, feedback: '稳妥推进，房玄龄称此法可收长远之效。' }
          ]
        },
        {
          id: 4, stage: 'early', storyline: 'reform', historicalYear: '627', title: '均田制推行',
          desc: '房玄龄建议按均田制重新丈量土地，抑制世家大族兼并。此举触动了许多旧族利益。',
          options: [
            { text: '强力推行，不论阻力', effects: { fangxuanling: 20, weizheng: 10, changsun: -20, yuchi: -5, stability: -5 }, feedback: '百姓受益，但世家怨声载道，长孙无忌首当其冲。' },
            { text: '暂缓，待秋收后再议', effects: { changsun: 10, fangxuanling: -10, weizheng: -5 }, feedback: '旧族满意，但均田制遥遥无期。' },
            { text: '只在新开垦地区试行', effects: { fangxuanling: 15, changsun: 5, weizheng: 5, yuchi: 5 }, feedback: '避开了旧族核心利益，改革得以启动。' }
          ]
        },
        {
          id: 5, stage: 'early', storyline: 'reform', historicalYear: '627', title: '修订唐律',
          desc: '房玄龄主持修订唐律，主张"死者不可复生"，减少死刑条款。尉迟敬德认为乱世当用重典。',
          options: [
            { text: '采纳宽刑建议', effects: { fangxuanling: 20, weizheng: 15, yuchi: -15, changsun: 5, stability: 5 }, feedback: '天下称颂贞观德政，但武将担心刑过宽则民不畏。' },
            { text: '维持旧律，乱世重典', effects: { yuchi: 15, weizheng: -15, fangxuanling: -15, stability: -5 }, feedback: '朝堂肃杀，但社会秩序得以维持。' },
            { text: '宽严并济，分情定罪', effects: { fangxuanling: 15, weizheng: 10, yuchi: 5, changsun: 5 }, feedback: '各方各得其所，律令修订顺利进行。' }
          ]
        },
        {
          id: 6, stage: 'early', storyline: 'weizheng', historicalYear: '627', title: '魏征直谏修宫殿',
          desc: '魏征上书反对修建洛阳宫，言辞激烈："隋炀帝前车之鉴，陛下不可重蹈覆辙！"',
          options: [
            { text: '接受谏言，停工', effects: { weizheng: 25, yuchi: -10, stability: 5 }, feedback: '魏征伏地叩首，称颂圣明；武将们却觉得丢了面子。' },
            { text: '驳回谏言，继续修建', effects: { weizheng: -20, yuchi: 10, stability: -10 }, feedback: '宫殿继续修建，劳民伤财，朝野议论纷纷。' },
            { text: '缩减规模，折中处理', effects: { weizheng: 10, yuchi: 5, fangxuanling: 5 }, feedback: '房玄龄称此法可省国库，各方亦有台阶。' }
          ]
        },
        {
          id: 7, stage: 'early', storyline: 'weizheng', historicalYear: '627', title: '整饬吏治',
          desc: '魏征弹劾数名贪官污吏，其中一人与长孙无忌有旧。长孙请求从轻发落。',
          options: [
            { text: '支持魏征，依法查办', effects: { weizheng: 25, changsun: -15, fangxuanling: 10, stability: 5 }, feedback: '贪官落马，朝野震动，清流士气大振。' },
            { text: '从轻发落，顾全长孙颜面', effects: { changsun: 15, weizheng: -20, fangxuanling: -10, stability: -10 }, feedback: '魏征当众叹息，百姓议论纷纷。' },
            { text: '撤职查办，但不株连家人', effects: { weizheng: 10, changsun: 5, fangxuanling: 10 }, feedback: '既整肃了吏治，又未过度牵连，各方尚可接受。' }
          ]
        },
        {
          id: 8, stage: 'early', storyline: 'reform', historicalYear: '628', title: '科举取士风波',
          desc: '今科进士多出自寒门，世家大族不满，长孙无忌暗示应"照顾旧族"。',
          options: [
            { text: '坚持唯才是举，不论出身', effects: { weizheng: 20, changsun: -20, fangxuanling: 10, stability: 5 }, feedback: '寒门士子感恩戴德，世家怨气暗生，房玄龄称此乃长久之计。' },
            { text: '增加世家推荐名额', effects: { changsun: 25, weizheng: -20, fangxuanling: -15, stability: -5 }, feedback: '旧族满意，但清流痛斥开历史倒车，房玄龄反对无效。' },
            { text: '维持原榜，另设恩科', effects: { changsun: 10, weizheng: 5, fangxuanling: 15 }, feedback: '两边都有台阶下，风波暂时平息，房玄龄赞你折中得法。' }
          ]
        },
        {
          id: 9, stage: 'early', storyline: 'prince', historicalYear: '627', title: '长孙请立太子',
          desc: '长孙无忌上奏，请求正式册立李承乾为太子，以定国本。',
          options: [
            { text: '立即册立', effects: { changsun: 25, weizheng: -15, yuchi: -5, fangxuanling: -5, stability: -5 }, feedback: '太子之位既定，但魏征与房玄龄皆忧虑外戚坐大。' },
            { text: '暂缓，再观察诸皇子', effects: { changsun: -20, weizheng: 10, yuchi: 10, fangxuanling: -5, stability: 5 }, feedback: '长孙无忌表面恭顺，心中已有芥蒂。' },
            { text: '册立但削减太子府属官', effects: { changsun: 5, weizheng: 5, yuchi: 5, fangxuanling: 15 }, feedback: '国本既立，又防外戚专权，房玄龄称此举深得制衡之道。' }
          ]
        },
        {
          id: 10, stage: 'early', storyline: null, historicalYear: '628', title: '突厥内乱',
          desc: '628年，突厥颉利可汗与其侄突利可汗内斗，草原各部离心。朝臣对此看法不一。',
          options: [
            { text: '支持尉迟敬德整军备战', effects: { yuchi: 20, changsun: -5, weizheng: -5, fangxuanling: 5, stability: 5 }, feedback: '尉迟敬德摩拳擦掌，但国库和民生尚未准备好。' },
            { text: '支持长孙无忌静观其变', effects: { changsun: 15, yuchi: -15, weizheng: 5, fangxuanling: -5 }, feedback: '突厥继续内耗，但尉迟敬德认为这是错失良机。' },
            { text: '派房玄龄遣使分化突厥各部', effects: { fangxuanling: 20, changsun: 5, yuchi: 5, weizheng: -5, stability: 10 }, feedback: '房玄龄暗中联络突厥反对派，为未来北伐埋下伏笔。' }
          ]
        },
        {
          id: 11, stage: 'early', storyline: null, historicalYear: '629', title: '尉迟争座',
          desc: '尉迟敬德在宴会上因座次排在长孙无忌之后，当众发怒："我有夺门之功，岂能让文官压一头！"',
          options: [
            { text: '训斥尉迟，维护礼制', effects: { yuchi: -20, changsun: 20, weizheng: 10 }, feedback: '尉迟敬德悻悻退下，长孙无忌微微颔首，魏征眼中闪过赞许。' },
            { text: '安抚尉迟，给他更高座次', effects: { yuchi: 20, changsun: -20, weizheng: -20 }, feedback: '尉迟敬德得意洋洋，长孙无忌面色阴沉，魏征摇头叹息。' },
            { text: '和稀泥，各退一步', effects: { yuchi: 5, changsun: 5, weizheng: -10 }, feedback: '争端暂时平息，但魏征认为你软弱可欺。' }
          ]
        },
        {
          id: 12, stage: 'early', storyline: null, historicalYear: '629', title: '房玄龄请修国史',
          desc: '房玄龄建议设立史馆，修撰前朝国史，以明得失。魏征认为当前应以谏政为先。',
          options: [
            { text: '准奏，设立史馆', effects: { fangxuanling: 20, weizheng: -10, changsun: 5, stability: 5 }, feedback: '史官动笔，后世有据，但魏征认为眼前政事更急。' },
            { text: '驳回，先理朝政', effects: { fangxuanling: -15, weizheng: 15, changsun: -5 }, feedback: '魏征称善，房玄龄虽遗憾但无异议。' },
            { text: '由魏征兼领史馆', effects: { fangxuanling: 10, weizheng: 15, changsun: -5 }, feedback: '两贤共事，既修史又不忘谏政，可谓两全。' }
          ]
        },
        {
          id: 13, stage: 'early', storyline: 'weizheng', historicalYear: '629', title: '魏征弹劾皇亲',
          desc: '魏征上书弹劾一名皇亲国戚侵占民田，奏折中言辞激烈，甚至影射后宫。',
          options: [
            { text: '支持魏征，依法查办', effects: { weizheng: 25, changsun: -10, yuchi: -5, fangxuanling: 5, stability: -5 }, feedback: '民心大快，宗室对你颇有怨言，房玄龄认为此乃立威之机。' },
            { text: '压下奏折，保全皇亲', effects: { weizheng: -20, changsun: 10, yuchi: 5, fangxuanling: -10, stability: -10 }, feedback: '魏征当众叹息："陛下亦有私。"房玄龄摇头退朝。' },
            { text: '责令退还民田，不再追究', effects: { weizheng: 10, changsun: 5, yuchi: 5, fangxuanling: 10 }, feedback: '两边各退一步，民怨稍平，房玄龄赞你处事周全。' }
          ]
        },
        {
          id: 14, stage: 'early', storyline: null, historicalYear: '629', title: '房玄龄举荐贤才',
          desc: '房玄龄举荐几名寒门才子入仕，与长孙无忌推荐的世家子弟形成竞争。',
          options: [
            { text: '采纳房玄龄所荐', effects: { fangxuanling: 20, changsun: -15, weizheng: 10, stability: 5 }, feedback: '寒门得进，长孙无忌暗生不满。' },
            { text: '采纳长孙无忌所荐', effects: { changsun: 20, fangxuanling: -15, weizheng: -10, stability: -5 }, feedback: '世家得利，房玄龄默然。' },
            { text: '让二人各荐一半', effects: { fangxuanling: 5, changsun: 5, weizheng: -5 }, feedback: '各得其所，但魏征认为此举仍有结党之嫌。' }
          ]
        },
        {
          id: 15, stage: 'early', storyline: 'reform', historicalYear: '629', title: '减免赋税之争',
          desc: '关中大旱，魏征奏请减免赋税；长孙无忌担心国库空虚；尉迟敬德认为应先赈济军户。',
          options: [
            { text: '全面减税，开仓放粮', effects: { weizheng: 20, changsun: -10, yuchi: -5, fangxuanling: -10, stability: 10 }, feedback: '百姓称颂，但国库压力陡增，房玄龄忧虑后续开支。' },
            { text: '只减农税，军赋不变', effects: { yuchi: 15, weizheng: -5, changsun: 5, fangxuanling: -5 }, feedback: '尉迟敬德满意，但魏征与房玄龄认为不够彻底。' },
            { text: '以工代赈，暂不减税', effects: { changsun: 15, weizheng: -10, yuchi: 5, fangxuanling: 20, stability: -5 }, feedback: '房玄龄主持修渠赈灾，国库得以维持，灾民亦有生计。' }
          ]
        },
        // ==================== 贞观中期（630-639）====================
        {
          id: 21, stage: 'middle', storyline: 'turkic', historicalYear: '630', title: '突厥边报紧急',
          desc: '突厥骑兵犯边，边关告急。尉迟敬德请战，长孙无忌主张和谈，魏征认为应先整饬内政。',
          options: [
            { text: '派尉迟敬德出征', effects: { yuchi: 25, changsun: -10, weizheng: -5, stability: 5 }, feedback: '尉迟敬德得偿所愿，挥师北上，朝堂暂时安静。' },
            { text: '派使者议和', effects: { changsun: 20, yuchi: -20, weizheng: 10, stability: -5 }, feedback: '边境暂安，但尉迟敬德认为这是文官怯战。' },
            { text: '召房玄龄商议后发兵', effects: { yuchi: 10, fangxuanling: 15, changsun: -5, weizheng: -5, stability: 5 }, feedback: '房玄龄调拨粮草，尉迟敬德无后顾之忧，朝堂皆大欢喜。' }
          ]
        },
        {
          id: 22, stage: 'middle', storyline: 'turkic', prerequisite: 21, historicalYear: '630', title: '李靖请战',
          desc: '兵部尚书李靖主动请缨，主张出奇兵直击突厥牙帐，一举解决边患。',
          options: [
            { text: '准奏，命李靖出征', effects: { yuchi: 20, fangxuanling: 10, changsun: -5, weizheng: -5, stability: 5 }, feedback: '李靖率精骑北上，朝堂拭目以待。' },
            { text: '以稳为主，先守后攻', effects: { changsun: 15, yuchi: -15, fangxuanling: 5, weizheng: 5 }, feedback: '边境稳固，但战机稍纵即逝，尉迟敬德不满。' },
            { text: '让尉迟敬德与李靖分兵', effects: { yuchi: 15, fangxuanling: -5, changsun: -5, stability: -5 }, feedback: '两将争功，协调困难，战果平平。' }
          ]
        },
        {
          id: 23, stage: 'middle', storyline: 'turkic', prerequisite: 22, historicalYear: '630', title: '灭东突厥',
          desc: '李靖大破突厥，俘颉利可汗，东突厥灭亡。捷报传来，朝野欢腾。',
          options: [
            { text: '大赏功臣，举国欢庆', effects: { yuchi: 25, changsun: -10, fangxuanling: -5, stability: 10 }, feedback: '武将集团声势大振，文官们忧心忡忡。' },
            { text: '安抚降众，设立都督府', effects: { fangxuanling: 20, weizheng: 10, yuchi: 5, changsun: 5, stability: 15 }, feedback: '突厥降众归心，房玄龄的制度安排尽显智慧。' },
            { text: '迁徙突厥民众于中原', effects: { yuchi: 10, changsun: 15, weizheng: -10, fangxuanling: -10, stability: -5 }, feedback: '便于控制，但引发中原士民不满。' }
          ]
        },
        {
          id: 24, stage: 'middle', storyline: 'turkic', prerequisite: 23, historicalYear: '630', title: '天可汗尊号',
          desc: '西北诸蕃上表，尊你为"天可汗"。长孙无忌主张欣然接受，魏征提醒不可因此骄纵。',
          options: [
            { text: '接受尊号，大宴诸蕃', effects: { yuchi: 20, changsun: 15, weizheng: -10, fangxuanling: -5, stability: 10 }, feedback: '四夷来朝，贞观盛世气象初显。' },
            { text: '婉拒，只称大唐皇帝', effects: { weizheng: 20, fangxuanling: 15, yuchi: -10, changsun: -5, stability: 5 }, feedback: '魏征称圣明，但武将们觉得少了份荣耀。' },
            { text: '接受尊号但节俭操办', effects: { weizheng: 10, fangxuanling: 10, yuchi: 5, changsun: 5, stability: 10 }, feedback: '既得四夷之心，又不至劳民伤财。' }
          ]
        },
        {
          id: 25, stage: 'middle', storyline: null, historicalYear: '634', title: '长孙皇后病重',
          desc: '长孙皇后病重，临终前请求你不要重用长孙无忌，以防外戚专权。',
          options: [
            { text: '答应皇后，疏远长孙无忌', effects: { changsun: -20, weizheng: 15, fangxuanling: 10, stability: 5 }, feedback: '长孙无忌心中怨恨，但外戚势力得到遏制。' },
            { text: '安慰皇后，但仍重用长孙', effects: { changsun: 25, weizheng: -15, fangxuanling: -10, stability: -5 }, feedback: '长孙无忌感激涕零，但朝堂暗流涌动。' },
            { text: '沉默不语，待皇后去世后再议', effects: { changsun: 5, weizheng: -5, fangxuanling: 5 }, feedback: '皇后薨逝，朝堂之上人人自危。' }
          ]
        },
        {
          id: 26, stage: 'middle', storyline: 'harem', prerequisite: 25, historicalYear: '636', title: '长孙皇后去世',
          desc: '长孙皇后去世，后宫无主。朝臣建议你尽快册立新后，以定六宫。',
          options: [
            { text: '暂不册后，为先皇后守制', effects: { weizheng: 15, fangxuanling: 10, changsun: -10, stability: 5 }, feedback: '朝野称颂你情深义重，但后宫管理渐乱。' },
            { text: '从世家女中择新后', effects: { changsun: 20, weizheng: -10, fangxuanling: -5, stability: -5 }, feedback: '新后家族借机攀升，外戚势力再抬头。' },
            { text: '升贵妃代掌后宫', effects: { changsun: 5, yuchi: 5, weizheng: -5, fangxuanling: -5 }, feedback: '后宫暂时安定，但贵妃野心渐露。' }
          ]
        },
        {
          id: 27, stage: 'middle', storyline: null, historicalYear: '635', title: '尉迟私斗伤人',
          desc: '尉迟敬德在朝堂外与一名文官争执，一拳将其打伤。百官哗然，要求严惩。',
          options: [
            { text: '杖责二十，以儆效尤', effects: { yuchi: -20, changsun: 15, weizheng: 15, stability: 5 }, feedback: '尉迟敬德当众受辱，但朝纲得以整肃。' },
            { text: '口头训斥，从轻发落', effects: { yuchi: 10, changsun: -10, weizheng: -20, fangxuanling: -10, stability: -5 }, feedback: '尉迟敬德感激涕零，但清流与务实派都认为他恃功而骄。' },
            { text: '罚俸三月，令其闭门思过', effects: { yuchi: -5, changsun: 5, weizheng: 5, fangxuanling: 5 }, feedback: '处罚不痛不痒，各方皆有微词。' }
          ]
        },
        {
          id: 28, stage: 'middle', storyline: null, historicalYear: '635', title: '太上皇去世',
          desc: '635年，太上皇李渊驾崩。朝堂之上关于丧礼仪制议论纷纷，有人主张厚葬以显孝道。',
          options: [
            { text: '厚葬太上皇，举国哀悼', effects: { changsun: 15, weizheng: -10, yuchi: 5, fangxuanling: -10, stability: -5 }, feedback: '孝道可彰，但国库负担加重。' },
            { text: '从简办理，不扰民生', effects: { weizheng: 20, fangxuanling: 15, changsun: -10, yuchi: -5, stability: 5 }, feedback: '魏征与房玄龄皆称赞圣明，百姓无扰。' },
            { text: '按礼制办，不大操大办', effects: { changsun: 5, weizheng: 5, fangxuanling: 5, yuchi: 5 }, feedback: '中规中矩，各方无话可说。' }
          ]
        },
        {
          id: 29, stage: 'middle', storyline: 'prince', prerequisite: 9, historicalYear: '636', title: '太子狩猎伤民',
          desc: '太子李承乾出城狩猎，践踏农田，伤及百姓。魏征上书弹劾，长孙无忌力保太子年少。',
          options: [
            { text: '严惩太子，责令道歉', effects: { weizheng: 20, changsun: -20, fangxuanling: 10, stability: 5 }, feedback: '太子惶恐，百姓称颂，但长孙无忌心生怨恨。' },
            { text: '轻轻揭过，罚俸了事', effects: { changsun: 15, weizheng: -20, yuchi: 5, stability: -10 }, feedback: '魏征叹息，太子更加骄纵。' },
            { text: '让房玄龄教导太子礼仪', effects: { fangxuanling: 20, changsun: 5, weizheng: 5, yuchi: -5 }, feedback: '太子收敛，长孙无忌也无话可说。' }
          ]
        },
        {
          id: 30, stage: 'middle', storyline: 'prince', historicalYear: '638', title: '魏王献书',
          desc: '魏王李泰献上《括地志》，博得朝野赞誉。有人暗中提醒你，魏王有夺嫡之心。',
          options: [
            { text: '大加赏赐，鼓励魏王', effects: { changsun: -10, weizheng: -10, fangxuanling: -5, stability: -10 }, feedback: '魏王声势日隆，太子李承乾暗恨。' },
            { text: '嘉奖但明确太子地位', effects: { weizheng: 15, fangxuanling: 10, changsun: 10, stability: 5 }, feedback: '魏王失望，但朝局稳定。' },
            { text: '冷处理，不置可否', effects: { changsun: 5, fangxuanling: 5, weizheng: -5 }, feedback: '朝臣猜测纷纷，储位之争暗流涌动。' }
          ]
        },
        {
          id: 31, stage: 'middle', storyline: null, historicalYear: '638', title: '高昌国不服',
          desc: '西域高昌国仗着远离长安，停止朝贡，还劫掠丝路商队。尉迟敬德主张出兵。',
          options: [
            { text: '派侯君集远征高昌', effects: { yuchi: 20, fangxuanling: -10, changsun: -5, weizheng: -5, stability: 5 }, feedback: '大军西征，丝路畅通有望。' },
            { text: '遣使斥责，以观后效', effects: { changsun: 10, weizheng: 10, yuchi: -15, fangxuanling: 5 }, feedback: '高昌表面臣服，但劫掠未止。' },
            { text: '联合西突厥施压', effects: { fangxuanling: 15, yuchi: 5, changsun: 5, weizheng: -5 }, feedback: '不费一兵一卒，高昌被迫低头。' }
          ]
        },
        {
          id: 32, stage: 'middle', storyline: null, prerequisite: 31, historicalYear: '640', title: '侯君集平高昌',
          desc: '侯君集攻破高昌，俘获国王。如何处理高昌故地，朝臣意见不一。',
          options: [
            { text: '设西州，直接管辖', effects: { fangxuanling: 20, yuchi: 10, changsun: -5, weizheng: -10, stability: 5 }, feedback: '西域纳入版图，但治理成本大增。' },
            { text: '立高昌王族为傀儡', effects: { changsun: 15, fangxuanling: -5, yuchi: -5, weizheng: 5 }, feedback: '短期安稳，但日后反复。' },
            { text: '撤军，只要求高昌朝贡', effects: { weizheng: 15, fangxuanling: -10, yuchi: -15, stability: -5 }, feedback: '省却军费，但威严受损。' }
          ]
        },
        {
          id: 33, stage: 'middle', storyline: null, historicalYear: '641', title: '吐蕃请婚',
          desc: '吐蕃赞普松赞干布遣使求婚，请求尚大唐公主。尉迟敬德认为吐蕃蛮夷，不配与天家结亲。',
          options: [
            { text: '许嫁文成公主', effects: { fangxuanling: 20, weizheng: 10, yuchi: -15, changsun: 5, stability: 10 }, feedback: '唐蕃和亲，边疆安定，房玄龄称此乃长远之策。' },
            { text: '拒绝，派兵威慑', effects: { yuchi: 20, fangxuanling: -10, weizheng: -10, changsun: -5, stability: -10 }, feedback: '吐蕃恼怒，边境再起烽烟。' },
            { text: '拖延，先观其诚意', effects: { changsun: 10, fangxuanling: 5, yuchi: -5, weizheng: -5 }, feedback: '吐蕃使者久候，朝堂议论纷纷。' }
          ]
        },
        {
          id: 34, stage: 'middle', storyline: null, prerequisite: 33, historicalYear: '641', title: '文成公主入藏',
          desc: '文成公主远嫁吐蕃，带去了中原文化和技术。朝堂上有人担心此举会助长吐蕃实力。',
          options: [
            { text: '厚赐嫁妆，彰显天朝气度', effects: { fangxuanling: 15, weizheng: 10, yuchi: -5, changsun: -5, stability: 5 }, feedback: '吐蕃感恩，唐蕃关系进入蜜月期。' },
            { text: '限制技术书籍流出', effects: { yuchi: 10, weizheng: -5, fangxuanling: 10, changsun: 5 }, feedback: '有所保留，但吐蕃使者颇为失望。' },
            { text: '命尉迟敬德护送公主', effects: { yuchi: 20, fangxuanling: 5, weizheng: -5, stability: 5 }, feedback: '吐蕃敬畏唐军武力，和亲更有保障。' }
          ]
        },
        {
          id: 35, stage: 'middle', storyline: 'weizheng', historicalYear: '638', title: '魏征与房玄龄政见不合',
          desc: '魏征主张严惩贪官，房玄龄认为应以教化为主，二人当庭争辩。',
          options: [
            { text: '支持魏征，严刑峻法', effects: { weizheng: 20, fangxuanling: -15, changsun: 5, stability: 5 }, feedback: '朝堂肃杀，房玄龄担忧过犹不及。' },
            { text: '支持房玄龄，以教化为先', effects: { fangxuanling: 20, weizheng: -15, changsun: -5, stability: -5 }, feedback: '魏征认为你纵容贪腐，颇有微词。' },
            { text: '严办首恶，余者教化', effects: { weizheng: 10, fangxuanling: 15, changsun: 5, stability: 5 }, feedback: '二人各得其所，朝野称你处置得当。' }
          ]
        },
        {
          id: 36, stage: 'middle', storyline: null, historicalYear: '639', title: '边境军饷不足',
          desc: '兵部奏报军饷短缺，尉迟敬德要求加税，房玄龄主张裁撤老弱、精简开支。',
          options: [
            { text: '加征税赋，充实军饷', effects: { yuchi: 20, weizheng: -15, fangxuanling: -15, changsun: -5, stability: -10 }, feedback: '军队满意，但百姓负担加重。' },
            { text: '按房玄龄之策裁军省饷', effects: { fangxuanling: 25, yuchi: -20, weizheng: 10, changsun: 10, stability: 5 }, feedback: '国库减压，但尉迟敬德认为你在削他根基。' },
            { text: '向关中世家借款应急', effects: { changsun: 15, yuchi: 10, weizheng: -10, fangxuanling: -5, stability: -5 }, feedback: '军饷得解，但世家借此要官。' }
          ]
        },
        {
          id: 37, stage: 'middle', storyline: 'prince', prerequisite: 29, historicalYear: '639', title: '皇子争储暗流',
          desc: '太子李承乾与魏王李泰各有拥趸，朝臣开始站队。',
          options: [
            { text: '公开支持太子', effects: { changsun: 15, fangxuanling: 10, weizheng: -5, yuchi: -5 }, feedback: '国本稳固，但魏王党羽暗恨。' },
            { text: '敲打太子，抬高魏王', effects: { changsun: -15, weizheng: 15, fangxuanling: -5, yuchi: 5, stability: -5 }, feedback: '太子惶恐，朝局再生波澜。' },
            { text: '召集房玄龄等重臣共议', effects: { fangxuanling: 20, changsun: 5, weizheng: 10, yuchi: 5, stability: 5 }, feedback: '集思广益，储位之争暂息。' }
          ]
        },
        // ==================== 贞观晚年（640-649）====================
        {
          id: 38, stage: 'late', storyline: 'prince', prerequisite: 37, historicalYear: '643', title: '太子谋反被废',
          desc: '太子李承乾谋反事泄，证据确凿。长孙无忌痛哭流涕，请求你饶太子一命。',
          options: [
            { text: '废为庶人，流放黔州', effects: { changsun: -20, weizheng: 20, fangxuanling: 10, yuchi: 5, stability: 10 }, feedback: '太子被废，朝堂震动，但国法得以维护。' },
            { text: '从轻处置，幽禁东宫', effects: { changsun: 15, weizheng: -20, fangxuanling: -10, stability: -10 }, feedback: '长孙无忌感激，但魏征认为国法败坏。' },
            { text: '让房玄龄彻查党羽', effects: { fangxuanling: 20, changsun: -10, weizheng: 10, yuchi: -5, stability: 5 }, feedback: '牵连甚广，但朝局得以澄清。' }
          ]
        },
        {
          id: 39, stage: 'late', storyline: 'prince', prerequisite: 38, historicalYear: '643', title: '立李治为太子',
          desc: '太子被废后，魏王李泰咄咄逼人，晋王李治仁弱。长孙无忌力主立李治。',
          options: [
            { text: '立晋王李治为太子', effects: { changsun: 25, fangxuanling: 10, weizheng: -5, yuchi: -5, stability: 5 }, feedback: '李治成为太子，长孙无忌影响力大增。' },
            { text: '立魏王李泰为太子', effects: { changsun: -20, weizheng: -10, fangxuanling: -10, yuchi: 10, stability: -10 }, feedback: '魏王得意，但朝臣多有不服。' },
            { text: '让重臣廷议，再作决定', effects: { fangxuanling: 15, weizheng: 10, changsun: 5, yuchi: 5, stability: 5 }, feedback: '朝堂共议，太子之位最终尘埃落定。' }
          ]
        },
        {
          id: 40, stage: 'late', storyline: 'weizheng', prerequisite: 35, historicalYear: '643', title: '魏征病危',
          desc: '魏征病重，上最后一道奏疏，直言你的十大过失。长孙无忌认为魏征不敬。',
          options: [
            { text: '亲自探望，嘉纳谏言', effects: { weizheng: 25, fangxuanling: 15, changsun: -10, stability: 10 }, feedback: '魏征涕泪横流，朝野称颂圣明。' },
            { text: '嘉纳谏言但不去探望', effects: { weizheng: 15, fangxuanling: 5, changsun: 5 }, feedback: '魏征感激，但民间有微词。' },
            { text: '斥责魏征临死不敬', effects: { weizheng: -20, changsun: 15, yuchi: 5, stability: -10 }, feedback: '魏征含恨而终，清流人心离散。' }
          ]
        },
        {
          id: 41, stage: 'late', storyline: 'weizheng', prerequisite: 40, historicalYear: '643', title: '魏征去世',
          desc: '魏征去世。你悲痛欲绝，欲以最高规格安葬，但长孙无忌提醒不可过于优厚。',
          options: [
            { text: '辍朝五日，亲撰碑文', effects: { weizheng: 10, fangxuanling: 10, changsun: -10, yuchi: -5, stability: 10 }, feedback: '天下感念，贞观朝堂失去了一面镜子。' },
            { text: '按礼制安葬，不逾规格', effects: { changsun: 10, weizheng: 5, fangxuanling: 5, yuchi: 5 }, feedback: '中规中矩，但少了些人情味。' },
            { text: '薄葬，以示节俭', effects: { weizheng: -10, fangxuanling: 15, changsun: 10, yuchi: 5 }, feedback: '魏征家人无怨，但朝臣议论纷纷。' }
          ]
        },
        {
          id: 42, stage: 'late', storyline: 'harem', prerequisite: 26, historicalYear: '637', title: '武才人入宫',
          desc: '武氏以才人身份入宫。她容貌出众，又工于心计，很快引起朝臣注意。',
          options: [
            { text: '宠幸武氏，封为昭仪', effects: { changsun: -10, weizheng: -15, fangxuanling: -10, yuchi: 5, stability: -10 }, feedback: '后宫暗流涌动，朝臣担忧女主干政。' },
            { text: '保持距离，只封为才人', effects: { weizheng: 10, fangxuanling: 10, changsun: 5, stability: 5 }, feedback: '武氏表面上恭顺，心中暗藏野心。' },
            { text: '将其遣出宫外', effects: { weizheng: 15, fangxuanling: 5, changsun: 5, yuchi: -5, stability: 5 }, feedback: '杜绝后患，但民间传说纷纷。' }
          ]
        },
        {
          id: 43, stage: 'late', storyline: 'harem', prerequisite: 42, historicalYear: '649', title: '后宫干政阴影',
          desc: '武氏开始参与政务，借着你的宠爱干预人事。长孙无忌与魏征旧部联合上书反对。',
          options: [
            { text: '呵斥武氏，令其退回后宫', effects: { weizheng: 15, changsun: 15, fangxuanling: 10, yuchi: -5, stability: 10 }, feedback: '武氏表面认错，眼中闪过不甘。' },
            { text: '默许，但限制其范围', effects: { changsun: -5, weizheng: -10, fangxuanling: -5, yuchi: 5 }, feedback: '后宫干政之门渐开，朝臣忧心忡忡。' },
            { text: '让房玄龄出面调和', effects: { fangxuanling: 15, changsun: 5, weizheng: 5, yuchi: -5 }, feedback: '暂时平息，但隐患未除。' }
          ]
        },
        {
          id: 44, stage: 'late', storyline: null, historicalYear: '645', title: '征高丽之议',
          desc: '高丽反复无常，你欲御驾亲征。房玄龄认为国力未复，尉迟敬德则跃跃欲试。',
          options: [
            { text: '御驾亲征，扬我国威', effects: { yuchi: 25, changsun: -10, weizheng: -15, fangxuanling: -20, stability: -15 }, feedback: '大军东征，但劳民伤财，战果未达预期。' },
            { text: '派将领征讨，你不亲征', effects: { yuchi: 10, fangxuanling: 5, weizheng: -5, changsun: 5, stability: -5 }, feedback: '损失较小，但高丽未被彻底征服。' },
            { text: '暂缓东征，先修内政', effects: { fangxuanling: 20, weizheng: 15, yuchi: -15, changsun: 10, stability: 10 }, feedback: '国库得以恢复，但武将集团颇有怨言。' }
          ]
        },
        {
          id: 45, stage: 'late', storyline: null, historicalYear: '649', title: '晚年感慨',
          desc: '你夜读《隋书》，见炀帝败亡之迹，召房玄龄、长孙无忌等人议事，感慨治国之难。',
          options: [
            { text: '告诫后人以隋为鉴', effects: { fangxuanling: 15, weizheng: 10, changsun: 5, yuchi: -5, stability: 10 }, feedback: '群臣称颂，贞观之治的精神得以传承。' },
            { text: '论功行赏，安抚老臣', effects: { yuchi: 15, changsun: 15, fangxuanling: 5, weizheng: -5 }, feedback: '老臣感激，但国库再受压力。' },
            { text: '沉默不语，独坐良久', effects: { fangxuanling: 5, weizheng: 5, changsun: -5, yuchi: 5 }, feedback: '群臣退下，殿中只剩你一人与史书为伴。' }
          ]
        },
        {
          id: 46, stage: 'late', storyline: null, historicalYear: '643', title: '长孙无忌排挤房玄龄',
          desc: '长孙无忌多次在奏对中暗示房玄龄"权柄过重"，建议分其权责。',
          options: [
            { text: '分房玄龄之权', effects: { changsun: 20, fangxuanling: -20, weizheng: -5, stability: -5 }, feedback: '房玄龄心灰意冷，魏征为你惋惜。' },
            { text: '驳斥长孙，信任房玄龄', effects: { changsun: -20, fangxuanling: 25, weizheng: 10, stability: 5 }, feedback: '房玄龄感念知遇，长孙无忌悻悻而退。' },
            { text: '令二人共理政务，互相牵制', effects: { changsun: 5, fangxuanling: 5, weizheng: 5, yuchi: -5 }, feedback: '朝堂再平衡，但效率略降。' }
          ]
        },
        {
          id: 47, stage: 'late', storyline: null, historicalYear: '643', title: '尉迟敬德请辞兵权',
          desc: '尉迟敬德以年老为由请辞禁军统领，朝中有人建议顺水推舟，也有人认为会寒了功臣心。',
          options: [
            { text: '准辞，赐金还乡', effects: { yuchi: -20, changsun: 10, weizheng: 10, fangxuanling: 15, stability: 5 }, feedback: '尉迟敬德黯然离去，但皇权得以巩固。' },
            { text: '挽留，仍掌兵权', effects: { yuchi: 20, changsun: -10, weizheng: -10, fangxuanling: -10, stability: -5 }, feedback: '尉迟敬德感激，但文官们忧心忡忡。' },
            { text: '改任虚衔，另派亲信掌兵', effects: { yuchi: -5, changsun: 5, weizheng: -5, fangxuanling: 10 }, feedback: '房玄龄称此为上策，尉迟敬德虽不满但尚可接受。' }
          ]
        },
        {
          id: 48, stage: 'late', storyline: null, historicalYear: '643', title: '凌烟阁画像排序',
          desc: '643年，凌烟阁二十四功臣画像即将完成。排定画像次序，直接关系到各方势力的脸面。',
          options: [
            { text: '长孙无忌居首', effects: { changsun: 20, yuchi: -20, weizheng: -5, fangxuanling: -5 }, feedback: '文官集团欢欣鼓舞，武将侧目。' },
            { text: '尉迟敬德居首', effects: { yuchi: 20, changsun: -20, weizheng: -5, fangxuanling: -5 }, feedback: '武将集团扬眉吐气，文官心生不满。' },
            { text: '按功绩平衡排列', effects: { changsun: 5, yuchi: 5, weizheng: 10, fangxuanling: 10 }, feedback: '魏征与房玄龄称赞你公允，朝堂相安无事。' }
          ]
        },
        {
          id: 49, stage: 'late', storyline: null, historicalYear: '649', title: '长孙推荐太子党',
          desc: '长孙无忌再次推荐几位亲信担任东宫属官，暗示这是为了"太子未来的班底"。',
          options: [
            { text: '全部批准', effects: { changsun: 25, weizheng: -20, fangxuanling: -10, stability: -10 }, feedback: '长孙无忌势力大增，魏征怒斥结党营私，房玄龄默然不语。' },
            { text: '拒绝，坚持任人唯贤', effects: { changsun: -20, weizheng: 20, fangxuanling: 10, stability: 5 }, feedback: '魏征与房玄龄皆称赞圣明，长孙无忌心中不悦。' },
            { text: '批准一半，留一半自己任命', effects: { changsun: 10, weizheng: 5, fangxuanling: 5 }, feedback: '两边都得了些好处，朝局维持平衡。' }
          ]
        },
        {
          id: 50, stage: 'late', storyline: null, historicalYear: '649', title: '文武两派当庭争执',
          desc: '长孙无忌与尉迟敬德为一件军务互相攻讦，朝堂之上剑拔弩张。',
          options: [
            { text: '让房玄龄居中调停', effects: { fangxuanling: 20, changsun: 5, yuchi: 5, weizheng: -5, stability: 5 }, feedback: '房玄龄两边安抚，争端平息，魏征却觉得你在和稀泥。' },
            { text: '各打五十大板', effects: { changsun: -10, yuchi: -10, weizheng: 10, fangxuanling: 5 }, feedback: '魏征称赞你公正，但两派首领皆感不快。' },
            { text: '支持长孙，压制尉迟', effects: { changsun: 15, yuchi: -20, weizheng: -5, fangxuanling: -5, stability: -5 }, feedback: '文官得势，尉迟敬德怒目而退。' }
          ]
        },
        {
          id: 51, stage: 'late', storyline: 'prince', prerequisite: 39, historicalYear: '644', title: '太子李治年幼',
          desc: '新太子李治年仅十五，性格仁弱。朝臣担忧他能否驾驭长孙无忌等重臣，有人建议提前培养太子班底。',
          options: [
            { text: '让房玄龄兼领太子太傅', effects: { fangxuanling: 20, changsun: -10, weizheng: 10, yuchi: -5, stability: 5 }, feedback: '房玄龄悉心教导，太子渐有明君气象，长孙无忌暗生警觉。' },
            { text: '一切托付长孙无忌', effects: { changsun: 25, fangxuanling: -10, weizheng: -15, stability: -5 }, feedback: '长孙无忌权势更盛，魏征旧部忧心忡忡。' },
            { text: '令太子旁听朝议，自行历练', effects: { weizheng: 10, fangxuanling: 10, changsun: 5, yuchi: 5, stability: 5 }, feedback: '太子耳濡目染，虽进展缓慢但根基扎实。' }
          ]
        },
        {
          id: 52, stage: 'late', storyline: 'harem', prerequisite: 43, historicalYear: '647', title: '武氏结交朝臣',
          desc: '武氏借替你批阅奏折之机，暗中与几位年轻朝臣往来。密报传入长孙无忌耳中。',
          options: [
            { text: '严令武氏不得干政', effects: { weizheng: 10, changsun: 15, fangxuanling: 10, yuchi: 5, stability: 10 }, feedback: '武氏表面顺从，眼中寒意更甚。' },
            { text: '不置可否，静观其变', effects: { changsun: -10, weizheng: -5, fangxuanling: -5, yuchi: 5 }, feedback: '后宫暗流涌动，朝臣纷纷猜测圣意。' },
            { text: '借机敲打长孙无忌，不要多管后宫', effects: { changsun: -15, fangxuanling: 5, weizheng: -5, yuchi: -5, stability: -5 }, feedback: '长孙无忌面色铁青退朝，朝堂气氛骤然紧张。' }
          ]
        },
        {
          id: 53, stage: 'late', storyline: null, historicalYear: '644', title: '魏征碑毁',
          desc: '你曾答应为魏征立碑，如今有人揭发魏征生前曾推荐过侯君集等人。你怒而推倒了魏征的墓碑。',
          options: [
            { text: '推倒墓碑，以儆效尤', effects: { weizheng: -20, changsun: 10, yuchi: 10, fangxuanling: -15, stability: -10 }, feedback: '朝野哗然，清流人心离散，房玄龄叹息不已。' },
            { text: '恢复墓碑，承认冲动', effects: { weizheng: 15, fangxuanling: 15, changsun: -5, yuchi: -5, stability: 5 }, feedback: '你亲撰碑文重修，天下称颂你知过能改。' },
            { text: '不恢复碑，但追谥如故', effects: { weizheng: 5, changsun: 5, fangxuanling: 5, yuchi: 5 }, feedback: '各方各退一步，但魏征之名已蒙尘埃。' }
          ]
        },
        {
          id: 54, stage: 'late', storyline: null, historicalYear: '645', title: '房玄龄病重',
          desc: '房玄龄积劳成疾，上表请求致仕。朝堂之上，谁能接替他的位置，议论纷纷。',
          options: [
            { text: '极力挽留，赐药慰问', effects: { fangxuanling: 20, changsun: -5, weizheng: 10, yuchi: -5, stability: 5 }, feedback: '房玄龄带病理政，朝堂运转如常。' },
            { text: '准其致仕，以长孙无忌兼理', effects: { changsun: 20, fangxuanling: -15, weizheng: -10, yuchi: 5, stability: -5 }, feedback: '长孙无忌权势更盛，朝堂天平再次倾斜。' },
            { text: '令太子亲往探望，以示恩宠', effects: { fangxuanling: 15, changsun: 5, weizheng: 5, yuchi: 5, stability: 10 }, feedback: '太子与房玄龄情谊日深，为未来埋下伏笔。' }
          ]
        },
        {
          id: 55, stage: 'late', storyline: null, historicalYear: '646', title: '尉迟敬德闭门修道',
          desc: '尉迟敬德彻底淡出朝堂，在家中炼丹修道。有人告发他私藏甲胄，意图不轨。',
          options: [
            { text: '亲自探望，以示不疑', effects: { yuchi: 20, changsun: -10, weizheng: 10, fangxuanling: 10, stability: 10 }, feedback: '尉迟敬德涕泪横流，交出甲胄，誓以余生报效。' },
            { text: '派人查抄，以绝后患', effects: { yuchi: -20, changsun: 15, weizheng: 5, fangxuanling: -5, stability: -10 }, feedback: '尉迟敬德愤而绝食，旧部将校人人自危。' },
            { text: '置之不理，听其自然', effects: { yuchi: 5, changsun: 5, weizheng: -5, fangxuanling: 5 }, feedback: '朝臣议论纷纷，有人说你念旧情，有人说你软弱。' }
          ]
        },
        {
          id: 56, stage: 'late', storyline: null, historicalYear: '647', title: '太子太师之争',
          desc: '朝臣争论太子太师人选，长孙无忌推荐亲信，房玄龄旧部则主张选德高望重之臣。',
          options: [
            { text: '采纳长孙无忌所荐', effects: { changsun: 20, fangxuanling: -15, weizheng: -10, yuchi: -5, stability: -5 }, feedback: '太子身边尽是长孙党羽，魏征旧部忧心忡忡。' },
            { text: '采纳房玄龄旧部所荐', effects: { fangxuanling: 15, changsun: -15, weizheng: 10, yuchi: 5, stability: 5 }, feedback: '太子太师德高望重，长孙无忌面色不悦。' },
            { text: '令太子自选太师', effects: { weizheng: 10, fangxuanling: 10, changsun: 5, yuchi: 5, stability: 10 }, feedback: '太子选了魏征旧友，朝野称颂太子仁孝知贤。' }
          ]
        },
        {
          id: 57, stage: 'late', storyline: null, historicalYear: '648', title: '晚年求仙之议',
          desc: '你身体日渐衰弱，有人献上丹药，声称可延年益寿。魏征旧部上书反对，长孙无忌却劝你一试。',
          options: [
            { text: '拒绝丹药，以魏征为鉴', effects: { weizheng: 15, fangxuanling: 15, changsun: -10, yuchi: 5, stability: 10 }, feedback: '你当众焚毁丹方，朝野称颂圣明。' },
            { text: '私下服用，不令朝臣知', effects: { changsun: 15, yuchi: 10, weizheng: -15, fangxuanling: -10, stability: -10 }, feedback: '丹药毒性渐显，你精神恍惚，朝臣窃窃私语。' },
            { text: '令太医验药后再定', effects: { fangxuanling: 15, changsun: 5, weizheng: 5, yuchi: -5, stability: 5 }, feedback: '太医验出丹药含汞，你惊出一身冷汗。' }
          ]
        }
      ];
