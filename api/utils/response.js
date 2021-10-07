export function mountedResponse(body, status) {
  return {
    statusCode: status,
    body: JSON.stringify(body),
  };
};
