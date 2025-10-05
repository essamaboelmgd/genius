export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const paginate = async <T>(
  model: any,
  query: object = {},
  options: PaginationOptions = {},
  sort: object = { createdAt: -1 }
): Promise<PaginationResult<T>> => {
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(options.limit || 10, 100); // Max 100 items per page
  const skip = (page - 1) * limit;

  const totalItems = await model.countDocuments(query);
  const data = await model.find(query).sort(sort).skip(skip).limit(limit);

  const totalPages = Math.ceil(totalItems / limit);

  return {
    data,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  };
};