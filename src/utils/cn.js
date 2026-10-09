/** Une nombres de clase ignorando valores falsos: cn('a', false, 'b') -> "a b" */
export const cn = (...args) => args.flat(Infinity).filter(Boolean).join(' ')
