export function handleError(error: any) {
  const e = error as Error;

  console.info('handleError:', e);

  if (e.message.includes('exceeds the balance of the account')) {
    return new Error('exceeds the balance of the account');
  } else if (e.message.includes('User rejected the request.')) {
    return new Error('User rejected the request.');
  }

  return e;
}

export const EMPTY_ADDREE = '0x0000000000000000000000000000000000000000';
