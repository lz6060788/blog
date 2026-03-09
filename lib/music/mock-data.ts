import { Song } from '@/lib/types/entities'

// Mock music data for testing the music player UI
export const mockSongs: Song[] = [
  {
    id: '1',
    title: '夜曲',
    artist: '周杰伦',
    album: '十一月的萧邦',
    duration: 237, // 3:57
    audioUrl: '/demo.ogg',
    lyrics: `[00:00.00] 夜曲
[00:04.00] 周杰伦
[00:08.00] 十一月的萧邦

[00:12.00] 一群嗜血的蚂蚁 被腐肉所吸引
[00:16.00] 我面无表情 看孤独的风景
[00:20.00] 失去你 爱恨开始分明
[00:24.00] 失去你 还有什么事好关心
[00:28.00] 当鸽子不再象征和平
[00:32.00] 我终于被提醒 广场上喂食的是秃鹰
[00:36.00] 我用漂亮的押韵 形容被掠夺一空的爱情
[00:40.00] 啊 乌云开始遮蔽 夜色不纯净
[00:44.00] 公园里 葬礼的回音 在漫天飞行
[00:48.00] 送你的 白色玫瑰 在纯黑的环境凋零
[00:52.00] 乌鸦在树枝上诡异的很安静
[00:56.00] 静静听 我黑色的大衣 想温暖你日渐冰冷的回忆
[01:00.00] 走过的 走过的 生命
[01:04.00] 啊 四周弥漫雾气
[01:08.00] 我在空旷的墓地
[01:12.00] 老去后还爱你`
  },
  {
    id: '2',
    title: '稻香',
    artist: '周杰伦',
    album: '魔杰座',
    duration: 222, // 3:42
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    lyrics: `[00:00.00] 稻香
[00:04.00] 周杰伦
[00:08.00] 魔杰座

[00:12.00] 对这个世界如果你有太多的抱怨
[00:16.00] 跌倒了就不敢继续往前走
[00:20.00] 为什么人要这么的脆弱 堕落
[00:24.00] 请你打开电视看看
[00:28.00] 多少人为生命在努力勇敢的走下去
[00:32.00] 我们是不是该知足
[00:36.00] 珍惜一切 就算没有拥有
[00:40.00] 还记得你说家是唯一的城堡
[00:44.00] 随着稻香河流继续奔跑
[00:48.00] 微微笑 小时候的梦我知道
[00:52.00] 不要哭让萤火虫带着你逃跑
[00:56.00] 乡间的歌谣永远的依靠
[01:00.00] 回家吧 回到最初的美好`
  },
  {
    id: '3',
    title: '晴天',
    artist: '周杰伦',
    album: '叶惠美',
    duration: 269, // 4:29
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    lyrics: `[00:00.00] 晴天
[00:04.00] 周杰伦
[00:08.00] 叶惠美

[00:12.00] 故事的小黄花
[00:16.00] 从出生那年就飘着
[00:20.00] 童年的荡秋千
[00:24.00] 随记忆一直晃到现在
[00:28.00] Re Sol Sol Xi Do Xi La Sol La Xi Xi
[00:32.00] Xi Xi Xi Xi La Xi La Sol
[00:36.00] 刮风这天 我试过握着你手
[00:40.00] 但偏偏 雨渐渐 大到我看你不见
[00:44.00] 还有多久 我才能在你身边
[00:48.00] 等到放晴的那天 也许我会比较好一点
[00:52.00] 从前从前 有个人爱你很久
[00:56.00] 但偏偏 风渐渐 把距离吹得好远`
  },
  {
    id: '4',
    title: '七里香',
    artist: '周杰伦',
    album: '七里香',
    duration: 298, // 4:58
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    lyrics: `[00:00.00] 七里香
[00:04.00] 周杰伦
[00:08.00] 七里香

[00:12.00] 窗外的麻雀 在电线杆上多嘴
[00:16.00] 你说这一句 很有夏天的感觉
[00:20.00] 手中的铅笔 在纸上来来回回
[00:24.00] 我用几行字形容你是我的谁
[00:28.00] 秋刀鱼的滋味 猫跟你都想了解
[00:32.00] 初恋的香味 就这样被我们寻回
[00:36.00] 那温暖的阳光 像刚摘的鲜艳草莓
[00:40.00] 你说你舍不得吃掉这一种感觉
[00:44.00] 雨下整夜 我的爱溢出就像雨水
[00:48.00] 院子落叶 跟我的思念厚厚一叠
[00:52.00] 几句是非 也无法将我的热情冷却
[00:56.00] 你出现在我诗的每一页`
  },
  {
    id: '5',
    title: '青花瓷',
    artist: '周杰伦',
    album: '我很忙',
    duration: 239, // 3:59
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    lyrics: `[00:00.00] 青花瓷
[00:04.00] 周杰伦
[00:08.00] 我很忙

[00:12.00] 素胚勾勒出青花笔锋浓转淡
[00:16.00] 瓶身描绘的牡丹一如你初妆
[00:20.00] 冉冉檀香透过窗心事我了然
[00:24.00] 宣纸上走笔至此搁一半
[00:28.00] 釉色渲染仕女图韵味被私藏
[00:32.00] 而你嫣然的一笑如含苞待放
[00:36.00] 你的美一缕飘散 去到我去不了的地方
[00:40.00] 天青色等烟雨 而我在等你
[00:44.00] 炊烟袅袅升起 隔江千万里
[00:48.00] 在瓶底书汉隶仿前朝的飘逸
[00:52.00] 就当我为遇见你伏笔
[00:56.00] 天青色等烟雨 而我在等你
[01:00.00] 月色被打捞起 晕开了结局`
  }
]

// Helper function to format duration (seconds -> mm:ss)
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// Helper function to format duration for display (rounded to seconds)
export function formatDurationDisplay(seconds: number): string {
  const rounded = Math.round(seconds)
  const minutes = Math.floor(rounded / 60)
  const remainingSeconds = rounded % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// Helper function to parse LRC lyrics
export interface LrcLine {
  time: number // time in seconds
  text: string
}

export function parseLrc(lrc: string): LrcLine[] {
  const lines: LrcLine[] = []
  const lrcLines = lrc.split('\n')

  for (const line of lrcLines) {
    // Match [mm:ss.xx]
    const match = line.match(/\[(\d{2}):(\d{2}\.\d{2})\](.*)/)
    if (match) {
      const minutes = parseInt(match[1])
      const seconds = parseFloat(match[2])
      const text = match[3].trim()
      const time = minutes * 60 + seconds
      if (text) {
        lines.push({ time, text })
      }
    }
  }

  return lines.sort((a, b) => a.time - b.time)
}
