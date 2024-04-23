export class WebResponse<T> {
  data?: T;
  errors?: string;
  paging?: Paging;
}

export class Paging {
  total_page: number;
  page: number;
  size: number;
}
