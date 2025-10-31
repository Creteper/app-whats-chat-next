
export type AgentItems = {
  id: number,
  create_time: Date,
  sl_id: string,
  nik_name: string,
  wechat_id: string,
  sl_mask: string,
  is_search: number,
  sl_sex: string | "男" | "女",
  sl_intro: string,
  mask_open: string,
  type: string,
  owner: string,
  permission: number,
  owner_oepn: string,
  public: number,
  publish: number,
  human: number,
  mask_background: string,
  mask_open_degree: number,
  mask_character: string,
  mask_motivation: string,
  mask_reactive: string,
  mask_relationship: string,
  create_type: string,
  yuyan: string,
  fushi: string,
  zhuangtai: string,
  taidu: string,
  changsuo: string,
  mask_half: string,
  touxiang: string,
  p1: string,
  p2: string,
  p3: string,
  p4: string,
  myself: number,
  for_sex: string | "女性向" | "男性向"
  publish_sys: number,
  vip_level: number,
  room_slid: string,
  room_slname: string,
  free: string,
  voice_type: string,
  last_weibo: string
}


export type AiRecentItem = {
  low_load_event: number,
  room_load_1v1: number,
  room_load_event: number,
  logtime: string,
  my_name: string,
  not_read_cnt: number,
  sl_id: string,
  my_content: string,
  permission: number,
  chat_open: number,
  sl_create_type:string
}

export type AiChatItem = {
  chat_id: string,
  new_id: string,
  logtime: string,
  name: string,
  content: string,
  role: string | 'Human' | 'AI'
  ctype: string,
  img_url: string,
  quote_img_order: string,
  img_author: string | 'Human' | 'AI'
}