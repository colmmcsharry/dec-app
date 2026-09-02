import type { VideoEntry } from '@/data/module-videos';

/**
 * One continuous “whole module” Vimeo per slug (folder “Whole” on Vimeo).
 * Only modules with an entry get the playlist banner + continuous player.
 */
export const MODULE_WHOLE_VIDEOS: Partial<Record<string, VideoEntry>> = {
  sleep: {
    id: '1223306876',
    title: 'Sleep — Full Module',
    description: 'Watch Module 1 as one continuous video',
    duration: 2118,
    url: 'https://player.vimeo.com/video/1223306876?h=102cc36250',
    thumbnail:
      'https://i.vimeocdn.com/video/2196501040-587080d6c8073ddeff1ea0d2cb0a274f8d54b14ddc0ca882c6c19d6fa56e01b2-d_640x360?&r=pad&region=us',
  },
  'morning-routines': {
    id: '1223319422',
    title: 'Morning Routines — Full Module',
    description: 'Watch Module 2 as one continuous video',
    duration: 733,
    url: 'https://player.vimeo.com/video/1223319422?h=affdb2c49c',
    thumbnail:
      'https://i.vimeocdn.com/video/2196507231-0ba3e9dcb5948aa00c097e805ab1f52fc26fe7c6c189817a5b7bb7e4f4d7bb3e-d_640x360?&r=pad&region=us',
  },
  'energy-management': {
    id: '1223322069',
    title: 'Energy Management — Full Module',
    description: 'Watch Module 3 as one continuous video',
    duration: 1418,
    url: 'https://player.vimeo.com/video/1223322069?h=12e8ad9a48',
    thumbnail:
      'https://i.vimeocdn.com/video/2196510517-2fa04febe7ad38026fe23d2e4a1ab2387b3ec3db0b41e7a44e2d1e18b54c3b44-d_640x360?&r=pad&region=us',
  },
  mindfulness: {
    id: '1223322536',
    title: 'Creative Solutions — Full Module',
    description: 'Watch Module 4 as one continuous video',
    duration: 1261,
    url: 'https://player.vimeo.com/video/1223322536?h=ad1f8498ae',
    thumbnail:
      'https://i.vimeocdn.com/video/2196511879-b06715a7868016a1a5e2a30384fb06a2deeb39c10b84eb0b350081c3c4bdcaf5-d_640x360?&r=pad&region=us',
  },
  'move-2-perform': {
    id: '1223328613',
    title: 'Recovery — Full Module',
    description: 'Watch Module 5 as one continuous video',
    duration: 1114,
    url: 'https://player.vimeo.com/video/1223328613?h=861c9b2c32',
    thumbnail:
      'https://i.vimeocdn.com/video/2196519440-ed42b378984b46c5a1fa0f4c3e4a8ad430f33fc5340a1040f98175259c766ee5-d_640x360?&r=pad&region=us',
  },
  'thinking-2-perform': {
    id: '1223330833',
    title: 'Thinking 2 Perform — Full Module',
    description: 'Watch Module 6 as one continuous video',
    duration: 1405,
    url: 'https://player.vimeo.com/video/1223330833?h=155183d7ae',
    thumbnail:
      'https://i.vimeocdn.com/video/2196522617-2c2f38035a161a35b8259f88f1e1cad5d699032b65b45a5c90b00f11b6c42688-d_640x360?&r=pad&region=us',
  },
  recovery: {
    id: '1223332086',
    title: 'Move 2 Perform — Full Module',
    description: 'Watch Module 7 as one continuous video',
    duration: 2974,
    url: 'https://player.vimeo.com/video/1223332086?h=cefa809d23',
    thumbnail:
      'https://i.vimeocdn.com/video/2196527259-5cdb3a0d3fa8d872973862f79bcfde95ce171325ba4f35ae96392bd7d94d0f7a-d_640x360?&r=pad&region=us',
  },
  'fuel-2-perform': {
    id: '1223337766',
    title: 'Fuel 2 Perform — Full Module',
    description: 'Watch Module 8 as one continuous video',
    duration: 1867,
    url: 'https://player.vimeo.com/video/1223337766?h=dd9dd0c1f2',
    thumbnail:
      'https://i.vimeocdn.com/video/2196531121-36b8f855c38d9207ea0fa4536dc6fb64dc34d46e74f3be65ce88a6ae382ca424-d_640x360?&r=pad&region=us',
  },
  'stress-management': {
    id: '1223340706',
    title: 'Most Authentic You — Full Module',
    description: 'Watch Module 9 as one continuous video',
    duration: 1431,
    url: 'https://player.vimeo.com/video/1223340706?h=58993b71bd',
    thumbnail:
      'https://i.vimeocdn.com/video/2196534288-cb9e43aaada65388812f98bdab9a340147b21139bb5ac9bf04630310f49cbdbc-d_640x360?&r=pad&region=us',
  },
  habits: {
    id: '1223342695',
    title: 'Building Habits — Full Module',
    description: 'Watch Module 10 as one continuous video',
    duration: 1319,
    url: 'https://player.vimeo.com/video/1223342695?h=9eea89f35b',
    thumbnail:
      'https://i.vimeocdn.com/video/2196536862-3a8259c5084ab23be36dac805002f8862e12edb1b546d2e31498dff6dddbdca2-d_640x360?&r=pad&region=us',
  },
};

export function getModuleWholeVideo(slug: string): VideoEntry | undefined {
  return MODULE_WHOLE_VIDEOS[slug];
}

export function isModuleWholeVideoId(slug: string, videoId: string): boolean {
  return MODULE_WHOLE_VIDEOS[slug]?.id === videoId;
}
