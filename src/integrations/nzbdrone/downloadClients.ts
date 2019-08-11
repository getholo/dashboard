interface Props {
  enable: boolean
  priority?: number
  name: string
  host: string
  port?: number
}

interface DelugeProps extends Props {
  urlBase?: string
  password: string
  tvCategory: string
  tvImportedCategory?: string
  recentTvPriority?: 0 | 1
  olderTvPriority?: 0 | 1
  addPaused?: boolean
  useSsl?: boolean
}

export class Deluge {
  constructor(private props: DelugeProps) {
    // props is private
  }

  public implementationName = 'Deluge' as 'Deluge';
  public implementation = 'Deluge' as 'Deluge';
  public configContract = 'DelugeSettings' as 'DelugeSettings';
  public infoLink = 'https://github.com/Sonarr/Sonarr/wiki/Supported-DownloadClients#deluge';

  public enable = this.props.enable;
  public protocol = 'torrent' as 'torrent';
  public priority = this.props.priority || 1;
  public name = this.props.name;

  public fields = [
    {
      name: 'host',
      value: this.props.host || 'localhost',
    },
    {
      name: 'port',
      value: this.props.port || 8112,
    },
    {
      name: 'urlBase',
      value: this.props.urlBase,
    },
    {
      name: 'password',
      value: this.props.password || '',
    },
    {
      name: 'tvCategory',
      value: this.props.tvCategory || '',
    },
    {
      name: 'tvImportedCategory',
      value: this.props.tvImportedCategory,
    },
    {
      name: 'recentTvPriority',
      value: this.props.recentTvPriority || 0,
    },
    {
      name: 'olderTvPriority',
      value: this.props.olderTvPriority || 0,
    },
    {
      name: 'addPaused',
      value: this.props.addPaused || false,
    },
    {
      name: 'useSsl',
      value: this.props.useSsl || false,
    },
  ];
}

interface TransmissionProps extends Props {
  urlBase?: string
  username?: string
  password?: string
  tvCategory?: string
  tvDirectory?: string
  recentTvPriority?: 0 | 1
  olderTvPriority?: 0 | 1
  addPaused?: boolean
  useSsl?: boolean
}

export class Transmission {
  constructor(private props: TransmissionProps) {
    // props is private
  }

  public implementationName = 'Transmission' as 'Transmission';
  public implementation = 'Transmission' as 'Transmission';
  public configContract = 'TransmissionSettings' as 'TransmissionSettings';
  public infoLink = 'https://github.com/Sonarr/Sonarr/wiki/Supported-DownloadClients#transmission';

  public enable = this.props.enable;
  public protocol = 'torrent' as 'torrent';
  public priority = this.props.priority || 1;
  public name = this.props.name;

  public fields = [
    {
      name: 'host',
      value: this.props.host || 'localhost',
    },
    {
      name: 'port',
      value: this.props.port || 9091,
    },
    {
      name: 'urlBase',
      value: this.props.urlBase || '/transmission/',
    },
    {
      name: 'username',
      value: this.props.username,
    },
    {
      name: 'password',
      value: this.props.password,
    },
    {
      name: 'tvCategory',
      value: this.props.tvCategory,
    },
    {
      name: 'tvDirectory',
      value: this.props.tvDirectory,
    },
    {
      name: 'recentTvPriority',
      value: this.props.recentTvPriority || 0,
    },
    {
      name: 'olderTvPriority',
      value: this.props.olderTvPriority || 0,
    },
    {
      name: 'addPaused',
      value: this.props.addPaused || false,
    },
    {
      name: 'useSsl',
      value: this.props.useSsl || false,
    },
  ];
}

interface NzbgetProps extends Props {
  urlBase?: string
  username?: string
  password?: string
  tvCategory?: string
  recentTvPriority?: -100 | -50 | 0 | 50 | 100 | 900
  olderTvPriority?: -100 | -50 | 0 | 50 | 100 | 900
  addPaused?: boolean
  useSsl?: boolean
}

export class Nzbget {
  constructor(private props: NzbgetProps) {
    // props is private
  }

  public implementationName = 'NZBGet' as 'NZBGet';
  public implementation = 'Nzbget' as 'Nzbget';
  public configContract = 'NzbgetSettings' as 'NzbgetSettings';
  public infoLink = 'https://github.com/Sonarr/Sonarr/wiki/Supported-DownloadClients#nzbget';

  public enable = this.props.enable;
  public protocol = 'usenet' as 'usenet';
  public priority = this.props.priority || 1;
  public name = this.props.name;

  public fields = [
    {
      name: 'host',
      value: this.props.host || 'localhost',
    },
    {
      name: 'port',
      value: this.props.port || 6789,
    },
    {
      name: 'urlBase',
      value: this.props.urlBase,
    },
    {
      name: 'username',
      value: this.props.username,
    },
    {
      name: 'password',
      value: this.props.password,
    },
    {
      name: 'tvCategory',
      value: this.props.tvCategory || '',
    },
    {
      name: 'recentTvPriority',
      value: this.props.recentTvPriority || 0,
    },
    {
      name: 'olderTvPriority',
      value: this.props.olderTvPriority || 0,
    },
    {
      name: 'addPaused',
      value: this.props.addPaused || false,
    },
    {
      name: 'useSsl',
      value: this.props.useSsl || false,
    },
  ];
}

type QBittorrent = {
  enable: boolean,
  protocol: 'torrent',
  priority: number,
  name: string,
  fields: [
    {
      name: 'host',
      value: string,
    },
    {
      name: 'port',
      value: 8080 | number,
    },
    {
      name: 'username',
      value?: string,
    },
    {
      name: 'password',
      value?: string,
    },
    {
      name: 'tvCategory',
      value: string,
    },
    {
      name: 'tvImportedCategory',
      value?: string,
    },
    {
      name: 'recentTvPriority',
      value: 0 | 1,
    },
    {
      name: 'olderTvPriority',
      value: 0 | 1,
    },
    {
      name: 'initialState',
      value: 0 | 1 | 2,
    },
    {
      name: 'useSsl',
      value: boolean,
    },
  ],
  implementationName: 'qBittorrent',
  implementation: 'QBittorrent',
  configContract: 'QBittorrentSettings',
  infoLink: 'https://github.com/Sonarr/Sonarr/wiki/Supported-DownloadClients#qbittorrent',
}

type RTorrent = {
  enable: boolean,
  protocol: 'torrent',
  priority: number,
  name: string,
  fields: [
    {
      name: 'host',
      value: string,
    },
    {
      name: 'port',
      value: 8080 | number,
    },
    {
      name: 'urlBase',
      value: string,
    },
    {
      name: 'useSsl',
      value: boolean,
    },
    {
      name: 'username',
      value?: string,
    },
    {
      name: 'password',
      value?: string,
    },
    {
      name: 'tvCategory',
      value: string,
    },
    {
      name: 'tvImportedCategory',
      value?: string,
    },
    {
      name: 'tvDirectory',
      value?: string,
    },
    {
      name: 'recentTvPriority',
      value: 0 | 1 | 2 | 3,
    },
    {
      name: 'olderTvPriority',
      value: 0| 1 | 2 | 3,
    },
    {
      name: 'addStopped',
      value: boolean,
    },
  ],
  implementationName: 'rTorrent',
  implementation: 'RTorrent',
  configContract: 'RTorrentSettings',
  infoLink: 'https://github.com/Sonarr/Sonarr/wiki/Supported-DownloadClients#rtorrent',
}

type Sabnzbd = {
  enable: boolean,
  protocol: 'usenet',
  priority: number,
  name: string,
  fields: [
    {
      name: 'host',
      value: string,
    },
    {
      name: 'port',
      value: 8080 | number,
    },
    {
      name: 'urlBase',
      value?: string,
    },
    {
      name: 'apiKey',
      value?: string,
    },
    {
      name: 'username',
      value?: string,
    },
    {
      name: 'password',
      value?: string,
    },
    {
      name: 'tvCategory',
      value: string,
    },
    {
      name: 'recentTvPriority',
      value: -100 | -2 | -1 | 0 | 1 | 2,
    },
    {
      name: 'olderTvPriority',
      value: -100 | -2 | -1 | 0 | 1 | 2,
    },
    {
      name: 'useSsl',
      value: boolean,
    },
  ],
  implementationName: 'SABnzbd',
  implementation: 'Sabnzbd',
  configContract: 'SabnzbdSettings',
  infoLink: 'https://github.com/Sonarr/Sonarr/wiki/Supported-DownloadClients#sabnzbd',
}

type UTorrent = {
  enable: boolean,
  protocol: 'torrent',
  priority: number,
  name: string,
  fields: [
    {
      name: 'host',
      value: string,
    },
    {
      name: 'port',
      value: 8080,
    },
    {
      name: 'username',
      value?: string,
    },
    {
      name: 'password',
      value?: string,
    },
    {
      name: 'tvCategory',
      value: string,
    },
    {
      name: 'tvImportedCategory',
      value?: string,
    },
    {
      name: 'recentTvPriority',
      value: 0 | 1,
    },
    {
      name: 'olderTvPriority',
      value: 0 | 1,
    },
    {
      name: 'intialState',
      value: 0 | 1 | 2 | 3,
    },
  ],
  implementationName: 'uTorrent',
  implementation: 'UTorrent',
  configContract: 'UTorrentSettings',
  infoLink: 'https://github.com/Sonarr/Sonarr/wiki/Supported-DownloadClients#utorrent',
}

type Vuze = {
  enable: boolean,
  protocol: 'torrent',
  priority: number,
  name: string,
  fields: [
    {
      name: 'host',
      value: string,
    },
    {
      name: 'port',
      value: 9091 | number,
    },
    {
      name: 'urlBase',
      value?: string,
    },
    {
      name: 'username',
      value?: string,
    },
    {
      name: 'password',
      value?: string,
    },
    {
      name: 'tvCategory',
      value?: string,
    },
    {
      name: 'tvDirectory',
      value?: string,
    },
    {
      name: 'recentTvPriority',
      value: 0 | 1,
    },
    {
      name: 'olderTvPriority',
      value: 0 | 1,
    },
    {
      name: 'addPaused',
      value: boolean,
    },
    {
      name: 'useSsl',
      value: boolean,
    },
  ],
  implementationName: 'Vuze',
  implementation: 'Vuze',
  configContract: 'TransmissionSettings',
  infoLink: 'https://github.com/Sonarr/Sonarr/wiki/Supported-DownloadClients#vuze',
}

/*
  Save DownloadStation for a later date
*/

type TorrentDownloadStation = {
  enable: boolean,
  protocol: 'torrent',
  priority: number,
  name: string,
  fields: [
    {
      name: 'host',
      value: string,
    },
    {
      name: 'port',
      value: 5000 | number,
    },
    {
      name: 'username',
      value?: string,
    },
    {
      name: 'password',
      value?: string,
    },
    {
      name: 'tvCategory',
      value?: string,
    },
    {
      name: 'tvDirectory',
      value?: string,
    },
    {
      name: 'useSsl',
      value: boolean,
    },
  ],
  implementationName: 'Download Station',
  implementation: 'TorrentDownloadStation',
  configContract: 'DownloadStationSettings',
  infoLink: 'https://github.com/Sonarr/Sonarr/wiki/Supported-DownloadClients#torrentdownloadstation',
};

type UsenetDownloadStation = {
  enable: boolean,
  protocol: 'usenet',
  priority: number,
  name: string,
  fields: [
    {
      name: 'host',
      value: string,
    },
    {
      name: 'port',
      value: 5000 | number,
    },
    {
      name: 'username',
      value?: string,
    },
    {
      name: 'password',
      value?: string,
    },
    {
      name: 'tvCategory',
      value?: string,
    },
    {
      name: 'tvDirectory',
      value?: string,
    },
    {
      name: 'useSsl',
      value: boolean,
    },
  ],
  implementationName: 'Download Station',
  implementation: 'UsenetDownloadStation',
  configContract: 'DownloadStationSettings',
  infoLink: 'https://github.com/Sonarr/Sonarr/wiki/Supported-DownloadClients#usenetdownloadstation',
};

export default {
  Deluge,
  Transmission,
  Nzbget,
};
