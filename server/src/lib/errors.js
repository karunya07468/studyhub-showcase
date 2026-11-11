export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function parse(schema, value) {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new HttpError(400, 'Please check the information and try again.', result.error.issues.map(issue => ({ path: issue.path.join('.'), message: issue.message })));
  }
  return result.data;
}

export const safeUser = user => ({ id: user.id, name: user.name, email: user.email, course: user.course || '', shareQuizScores: Boolean(user.shareQuizScores) });
export const idOf = doc => String(doc._id);
export const dueString = value => value || '';
export const deviceIdOf = req => String(req.get('x-studyhub-device') || '').slice(0, 100);

export function publishChange(io, req, collection, action, id) {
  io.to(String(req.user.id)).emit('workspace:changed', { collection, action, id: id ? String(id) : null, deviceId: deviceIdOf(req) });
}

export function publishLeaderboard(io) {
  io.emit('leaderboard:changed');
}
