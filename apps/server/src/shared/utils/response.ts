export const success = <T>(data: T) => {
  return {
    data,
    message: "ok",
    code: 200,
    timestamp: Date.now(),
    ok: true,
  };
};

export const error = <T = null>(data: T, message = "error", code = 500) => {
  return {
    data,
    message,
    code,
    timestamp: Date.now(),
    ok: false,
  };
};
