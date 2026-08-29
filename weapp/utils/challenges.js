// 凌烟阁密档 - 阶段挑战配置（从 Web V3.0 同步）

// 数值截断（与 Web 版一致），scoreStep 内使用
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

module.exports = [
        {
          id: 'turkic_war',
          stageId: 'middle',
          title: '决战突厥',
          intro: '贞观三年，东突厥颉利可汗率十万铁骑南下，长安震动。满朝文武意见纷纭，你需在三道关键决策中把握战机。',
          steps: [
            {
              question: '突厥先锋逼近泾阳，长安震动。先命何人应对？',
              options: [
                { text: '派尉迟敬德领兵迎击', type: 'military' },
                { text: '令房玄龄统筹粮草、调度后勤', type: 'logistics' },
                { text: '遣魏征出使，以仁义拖延敌军', type: 'diplomacy' },
                { text: '召长孙无忌稳定朝局、筹措内应', type: 'politics' }
              ]
            },
            {
              question: '李靖上书请求率三千精骑夜袭定襄，是否准许？',
              options: [
                { text: '准，出奇制胜', type: 'military' },
                { text: '先保障粮草辎重，再议出兵', type: 'logistics' },
                { text: '发檄文先声夺人，动摇突厥军心', type: 'diplomacy' },
                { text: '暂缓，待朝议统一后再定', type: 'politics' }
              ]
            },
            {
              question: '颉利可汗遣使请和，实则欲图喘息。如何应对？',
              options: [
                { text: '尉迟敬德追击，不给喘息', type: 'military' },
                { text: '房玄龄接管降卒、安顿后勤', type: 'logistics' },
                { text: '魏征主张受降，彰显天朝气度', type: 'diplomacy' },
                { text: '长孙无忌建议分化突厥部众', type: 'politics' }
              ]
            }
          ],
          scoreStep: (s, opt) => {
            const map = { military: 'yuchi', logistics: 'fangxuanling', diplomacy: 'weizheng', politics: 'changsun' };
            const k = map[opt.type];
            const c = s.characters[k];
            let pts = Math.round(c.ability * 0.6 + (c.favor + c.power) / 2 * 0.2);
            pts += Math.floor(Math.random() * 11) - 5;
            return clamp(pts, 5, 50);
          },
          resolve: (s, score) => {
            if (score >= 110) return {
              rank: 'great', name: '大捷', desc: '李靖夜袭定襄，尉迟敬德追击阴山，东突厥就此覆灭。四夷君长共尊你为"天可汗"。',
              effects: { stability: 15, yuchi: { favor: 10, power: 10 }, fangxuanling: { favor: 5 }, weizheng: { favor: 5 }, changsun: { favor: 5 } }
            };
            if (score >= 80) return {
              rank: 'win', name: '小胜', desc: '唐军击退突厥主力，颉利可汗北遁。边境暂安，但未能一举扫平。',
              effects: { stability: 8, yuchi: { favor: 5, power: 5 }, fangxuanling: { favor: 3 } }
            };
            if (score >= 50) return {
              rank: 'stalemate', name: '僵持', desc: '战线胶着，粮草吃紧，朝野渐生怨言。',
              effects: { stability: -5, yuchi: { favor: -5 } }
            };
            return {
              rank: 'defeat', name: '溃败', desc: '突厥铁骑突破防线，长安人心惶惶。你不得不下罪己诏。',
              effects: { stability: -15, yuchi: { favor: -10, power: -10 }, fangxuanling: { favor: -5 } }
            };
          }
        },
        {
          id: 'prince_struggle',
          stageId: 'late',
          title: '储位暗涌',
          intro: '太子李承乾与魏王李泰各树朋党，朝局暗流涌动。你的每一步权衡，都将决定贞观继承人的命运。',
          steps: [
            {
              question: '太子近来骄纵，东宫属官多有不法。你决定：',
              options: [
                { text: '派魏征教导太子', balance: 15 },
                { text: '命房玄龄调查东宫属官', balance: 10 },
                { text: '私下敲打太子，削减用度', balance: 10 },
                { text: '召长孙无忌共商储事', balance: 5 }
              ]
            },
            {
              question: '魏王李泰献《括地志》，朝野称颂，隐有夺嫡之势。你决定：',
              options: [
                { text: '采纳魏征谏止，外王不宜干政', balance: 20 },
                { text: '令房玄龄校书，收归中枢', balance: 15 },
                { text: '厚赏魏王，助长其声望', balance: 5 },
                { text: '交长孙无忌处置', balance: 5 }
              ]
            },
            {
              question: '太子承乾谋反迹象渐露，是否易储？',
              options: [
                { text: '听魏征劝谏，暂缓废立', balance: 20 },
                { text: '命房玄龄暗中查证', balance: 15 },
                { text: '命尉迟敬德加强宫禁', balance: 10 },
                { text: '立即废太子，立晋王李治', balance: -15 }
              ]
            }
          ],
          scoreStep: (s, opt) => {
            const map = { weizheng: 'weizheng', fangxuanling: 'fangxuanling', yuchi: 'yuchi', changsun: 'changsun' };
            const k = map[opt.type] || 'fangxuanling';
            const c = s.characters[k];
            let pts = Math.round(c.ability * 0.6 + (c.favor + c.power) / 2 * 0.2);
            pts += Math.floor(Math.random() * 11) - 5;
            return clamp(pts, 5, 50);
          },
          resolve: (s, score) => {
            if (score >= 45) return {
              rank: 'stable', name: '朝局稳定', desc: '太子收敛、魏王知退，储位之争暂告平息。',
              effects: { stability: 10, changsun: { favor: 5 }, weizheng: { favor: 5 }, fangxuanling: { favor: 5 }, yuchi: { favor: 5 } }
            };
            if (score >= 25) return {
              rank: 'transit', name: '平稳过渡', desc: '虽有风波，但继承人之争未酿成大乱。',
              effects: { stability: 5 }
            };
            return {
              rank: 'chaos', name: '储位动荡', desc: '李承乾被废、李泰贬谪，朝堂元气大伤。',
              effects: { stability: -10, changsun: { favor: -5 }, weizheng: { favor: -5 }, fangxuanling: { favor: -5 }, yuchi: { favor: -5 } }
            };
          }
        },
        {
          id: 'final_review',
          stageId: 'ending',
          title: '凌烟阁终评',
          intro: '贞观之治已近尾声，史官请你对二十年功过做最后评定。这将载入凌烟阁，流传后世。',
          steps: [
            {
              question: '凌烟阁功臣排序，你首推何人？',
              options: [
                { text: '论功行赏，不分文武', legacy: 20 },
                { text: '首功给魏征等谏臣，以正朝风', legacy: 15 },
                { text: '首功给房玄龄等谋臣，以彰治世', legacy: 10 },
                { text: '首功给尉迟敬德等武将，以酬军功', legacy: 5 }
              ]
            },
            {
              question: '如何看待一生的直谏之臣？',
              options: [
                { text: '虚心纳谏，制度化言路', legacy: 20 },
                { text: '褒奖魏征，树为楷模', legacy: 15 },
                { text: '适可而止，维护皇权威严', legacy: 10 },
                { text: '厌恶逆耳之言，后人莫学', legacy: -10 }
              ]
            },
            {
              question: '你将如何安排身后之事？',
              options: [
                { text: '遗诏明确储君，不委政大臣', legacy: 20 },
                { text: '托孤房玄龄，以谋臣辅政', legacy: 10 },
                { text: '托孤长孙无忌，以国舅维稳', legacy: 5 },
                { text: '未做明确安排，顺其自然', legacy: -5 }
              ]
            }
          ],
          scoreStep: (s, opt) => {
            const avgAbility = Object.values(s.characters).reduce((a, b) => a + b.ability, 0) / 4;
            const avgFavor = Object.values(s.characters).reduce((a, b) => a + b.favor, 0) / 4;
            let pts = Math.round(avgAbility * 0.3 + avgFavor * 0.3 + opt.legacy * 0.4);
            pts += Math.floor(Math.random() * 11) - 5;
            return clamp(pts, 0, 50);
          },
          resolve: (s, score) => {
            const avgFavor = Object.values(s.characters).reduce((a, b) => a + b.favor, 0) / 4;
            const total = score + Math.round(avgFavor / 5);
            if (total >= 70) return {
              rank: 'legend', name: '贞观遗风', desc: '你留下的不仅是一个盛世，更是一套被后世称颂的君臣典范。',
              effects: { stability: 15 }
            };
            if (total >= 45) return {
              rank: 'good', name: '治世华章', desc: '虽有遗憾，但贞观之治仍足以光耀史册。',
              effects: { stability: 8 }
            };
            return {
              rank: 'mixed', name: '功过留待后人评', desc: '你的晚年留下诸多争议，史笔如刀，褒贬参半。',
              effects: { stability: -5 }
            };
          }
        }
      ];
