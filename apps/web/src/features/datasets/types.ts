export type Dataset = {
  id: string;
  name: string;
  createdAt?: string;
};

export type CreateDatasetInput = {
  name: string;
};
