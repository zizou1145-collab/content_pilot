/**
 * Map Prisma and common errors to HTTP status codes.
 * Services can set err.statusCode (e.g. 400, 404, 503); otherwise we infer from Prisma codes.
 */
function getStatusFromError(err) {
  if (err.statusCode && err.statusCode >= 400 && err.statusCode < 600) {
    return err.statusCode;
  }
  // Prisma: P2025 = record not found, P2003 = foreign key violation (bad reference)
  const code = err.code;
  if (code === 'P2025') return 404;
  if (code === 'P2003') return 400;
  if (code === 'P2002') return 409; // unique constraint
  return 500;
}

export function errorHandler(err, req, res, next) {
  console.error(err);
  const status = getStatusFromError(err);
  const message =
    err.message || (status === 500 ? 'Internal server error' : 'Request failed');
  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}
