import axios, { AxiosError } from 'axios';

const docker = axios.create({
  socketPath: '/var/run/docker.sock',
});

type Status = 'created' | 'restarting' | 'running' | 'removing' | 'paused' | 'exited' | 'dead'

interface StringToEmptyObject {
  [key: string]: {}
}

interface Labels {
  [key: string]: string
}

interface Healthcheck {
  Interval: number
  Retries: number
  StartPeriod: number
  Test: string[]
  Timeout: number
}

interface BlkioWeightDevice {
  Path: string
  Weight: number
}

interface ThrottleDevice {
  Path: string
  Rate: number
}

interface DeviceMapping {
  CgroupPermissions: string
  PathInContainer: string
  PathOnHost: string
}

interface DeviceRequest {
  Capabilities: string[]
  Count: number
  DeviceIDs: string[]
  Driver: string
  Options: {
    [key: string]: string
  }
}

interface Ulimit {
  Hard: number
  Name: string
  Soft: number
}

interface LogConfig {
  Config: {
    [key: string]: string
  }
  Type: 'json-file' | 'syslog' | 'journald' | 'gelf' | 'fluentd' | 'awslogs' | 'splunk' | 'etwlogs' | 'none'
}

export interface PortBinding {
  HostIp?: string
  HostPort: string
}

export interface PortMap {
  [key: string]: PortBinding[]
}

interface RestartPolicy {
  MaximumRetryCount?: number
  Name: '' | 'always' | 'unless-stopped' | 'on-failure'
}

interface BindOptions {
  NonRecursive?: boolean
  Propagation: 'private' | 'rprivate' | 'shared' | 'rshared' | 'slave' | 'rslave'
}

interface DriverConfig {
  Name: string
  Options?: {
    [key: string]: string
  }
}

interface VolumeOptions {
  DriverConfig?: DriverConfig
  Labels?: Labels
  NoCopy?: boolean
}

interface TmpfsOptions {
  Mode: number
  SizeBytes: number
}

interface Mount {
  Target: string
  Source: string
  Type: 'bind' | 'volume' | 'tmpfs' | 'npipe'
  ReadOnly?: boolean
  Consistency: 'default' | 'consistent' | 'cached' | 'delegated'
  BindOptions?: BindOptions
  TmpfsOptions?: TmpfsOptions
}

interface StorageOpt {
  [key: string]: string
}

interface Tmpfs {
  [key: string]: string
}

interface Sysctls {
  [key: string]: string
}

interface HostConfig {
  AutoRemove?: boolean
  Binds?: string[]
  BlkioDeviceReadBps?: ThrottleDevice[]
  BlkioDeviceReadIOps?: ThrottleDevice[]
  BlkioDeviceWriteBps?: ThrottleDevice[]
  BlkioDeviceWriteIOps?: ThrottleDevice[]
  BlkioWeight?: number
  BlkioWeightDevice?: BlkioWeightDevice[]
  CapAdd?: string[]
  CapDrop?: string[]
  Capabilities?: string[]
  Cgroup?: string
  CgroupParent?: string
  ConsoleSize?: number[]
  ContainerIDFile?: string
  CpuCount?: number
  CpuPercent?: number
  CpuPeriod?: number
  CpuQuota?: number
  CpuRealtimePeriod?: number
  CpuRealtimeRuntime?: number
  CpuShares?: number
  CpusetCpus?: string
  CpusetMems?: string
  DeviceCgroupRules?: string[]
  DeviceRequests?: DeviceRequest[]
  Devices?: DeviceMapping[]
  Dns?: string[]
  DnsOptions?: string[]
  DnsSearch?: string[]
  ExtraHosts?: string[]
  GroupAdd?: string[]
  IOMaximumBandwidth?: number
  IOMaximumIOps?: number
  Init?: boolean
  IpcMode?: 'none' | 'private' | 'shareable' | 'host' | string
  Isolation?: 'default' | 'process' | 'hyperv'
  KernelMemory?: number
  KernelMemoryTCP?: number
  Links?: string[]
  LogConfig?: LogConfig
  MaskedPaths?: string[]
  Memory?: number
  MemoryReservation?: number
  MemorySwap?: number
  MemorySwappiness?: number
  Mounts?: Mount[]
  NanoCPUs?: number
  NetworkMode?: 'bridge' | 'host' | 'none' | string
  OomKillDisable?: boolean
  OomScoreAdj?: number
  PidMode?: 'host' | string
  PidsLimit?: number
  PortBindings?: PortMap
  Privileged?: boolean
  PublishAllPorts?: boolean
  ReadonlyPaths?: string[]
  ReadonlyRootfs?: boolean
  RestartPolicy?: RestartPolicy
  Runtime?: string
  SecurityOpt?: string[]
  ShmSize?: number
  StorageOpt?: StorageOpt
  Sysctls?: Sysctls
  Tmpfs?: Tmpfs
  UTSMode?: string
  Ulimits?: Ulimit[]
  UsernsMode?: string
  VolumeDriver?: string
  VolumesFrom?: string[]
}

interface EndpointIPAMConfig {
  IPv4Address?: string
  IPv6Address?: string
  LinkLocalIPs?: string[]
}

interface DriverOpts {
  [key: string]: string
}

interface EndpointSettings {
  Aliases?: string[]
  DriverOpts?: DriverOpts
  EndpointID?: string
  Gateway?: string
  GlobalIPv6Address?: string
  GlobalIPv6PrefixLen?: number
  IPAMConfig?: EndpointIPAMConfig
  IPAddress?: string
  IPPrefixLen?: number
  IPv6Gateway?: string
  Links?: string[]
  MacAddress?: string
  NetworkID?: string
}

interface EndpointsConfig {
  [key: string]: EndpointSettings
}

interface NetworkingConfig {
  EndpointsConfig: EndpointsConfig
}

interface CreateProps {
  ArgsEscaped?: boolean
  AttachStderr?: boolean
  AttachStdin?: boolean
  AttachStdout?: boolean
  Cmd?: string[]
  Domainname?: string
  Entrypoint?: string[]
  Env?: string[]
  ExposedPorts?: StringToEmptyObject
  Healthcheck?: Healthcheck
  HostConfig?: HostConfig
  Hostname?: string
  Image?: string
  Labels?: Labels
  MacAddress?: string
  NetworkDisabled?: boolean
  NetworkingConfig?: NetworkingConfig
  OnBuild?: string[]
  OpenStdin?: boolean
  Shell?: string[]
  StdinOnce?: boolean
  StopSignal?: string
  StopTimeout?: number
  Tty?: boolean
  User?: string
  Volumes?: StringToEmptyObject
  WorkingDir?: string
}

interface CreateResponse {
  Id: string
  Warnings: string[]
}

async function create(name: string, config: CreateProps): Promise<CreateResponse> {
  const { data } = await docker.request<CreateResponse>({
    method: 'POST',
    url: '/containers/create',
    params: {
      name,
    },
    data: config,
  });
  console.log(data, config);

  return data;
}

interface Port {
  IP?: string
  PrivatePort: number
  PublicPort?: number
  Type: 'tcp' | 'udp' | 'sctp'
}

interface NetworkSettings {
  Networks: {
    [key: string]: EndpointSettings
  }
}

interface ContainerListView {
  Command: string
  Created: number
  HostConfig: {
    NetworkMode: string
  }
  Id: string
  Image: string
  ImageID: string
  Labels: Labels
  Mounts: Mount[]
  Names: string[]
  NetworkSettings: NetworkSettings
  Ports: Port[]
  SizeRootFs: number
  SizeRw: number
  State: string
  Status: string
}

interface ListFilters {
  'is-task'?: boolean
  ancestor?: string
  before?: string
  exited?: number
  expose?: string
  health?: 'starting' | 'healthy' | 'unhealthy' | 'none'
  id?: string
  isolation?: 'default' | 'process' | 'hyperv'
  label?: string
  name?: string
  network?: string
  publish?: string
  since?: string
  status?: Status
  volume?: string
}

interface ListProps {
  all?: boolean
  filters?: ListFilters
  limit?: number
  size?: boolean
}

async function list(params?: ListProps): Promise<ContainerListView[]> {
  const { data } = await docker.request<ContainerListView[]>({
    method: 'GET',
    url: '/containers/json',
    params: params && JSON.stringify(params),
  });

  return data;
}

async function start(id: string) {
  await docker.request({
    method: 'POST',
    url: `/containers/${id}/start`,
  }).catch((err: AxiosError) => {
    console.log(err.response.data);
  });
}

async function stop(id: string) {
  await docker.request({
    method: 'POST',
    url: `/containers/${id}/stop`,
  }).catch((err: AxiosError) => {
    console.log(err.response.data);
  });
}

async function remove(id: string, force?: boolean) {
  try {
    await docker.request({
      method: 'DELETE',
      url: `/containers/${id}`,
      params: {
        force,
      },
    });
  } catch {
    console.log('container does not exist');
  }
}

export default {
  create,
  list,
  remove,
  start,
  stop,
};
