interface Idata {
  storeId: string;
  estimatedTime: Date;
  numberOfPeople: number;
}

export class returnFindStoreServerDTO {
  isSuccess: boolean;
  datas?: Idata[];
}
