function errorHandler(err, req, res, next) {
  console.error(err);

  if (res.headersSent) {
    return next(err);
  }

  // Nunca vazar detalhes internos (stack trace, mensagens de banco) para o cliente.
  return res.status(err.status || 500).json({
    error: err.publicMessage || 'Erro interno no servidor.',
  });
}

module.exports = errorHandler;
