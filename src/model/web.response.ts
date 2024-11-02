export class WebResponse<T> {
  data?: T;
  errors?: string;
  paging?: Paging;
}

export class Paging {
  totalPage: number;
  page: number;
  size: number;
}
