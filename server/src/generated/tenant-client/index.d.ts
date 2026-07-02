
/**
 * Client
**/

import * as runtime from './runtime/client.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Medicamento
 * 
 */
export type Medicamento = $Result.DefaultSelection<Prisma.$MedicamentoPayload>
/**
 * Model Lote
 * 
 */
export type Lote = $Result.DefaultSelection<Prisma.$LotePayload>
/**
 * Model Paciente
 * 
 */
export type Paciente = $Result.DefaultSelection<Prisma.$PacientePayload>
/**
 * Model Prescricao
 * 
 */
export type Prescricao = $Result.DefaultSelection<Prisma.$PrescricaoPayload>
/**
 * Model Dispensacao
 * 
 */
export type Dispensacao = $Result.DefaultSelection<Prisma.$DispensacaoPayload>
/**
 * Model DispensacaoItem
 * 
 */
export type DispensacaoItem = $Result.DefaultSelection<Prisma.$DispensacaoItemPayload>
/**
 * Model EmbalageFracionada
 * 
 */
export type EmbalageFracionada = $Result.DefaultSelection<Prisma.$EmbalageFracionadaPayload>
/**
 * Model MovimentacaoFracionada
 * 
 */
export type MovimentacaoFracionada = $Result.DefaultSelection<Prisma.$MovimentacaoFracionadaPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient({
 *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
 * })
 * // Fetch zero or more Medicamentos
 * const medicamentos = await prisma.medicamento.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient({
   *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
   * })
   * // Fetch zero or more Medicamentos
   * const medicamentos = await prisma.medicamento.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://pris.ly/d/client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/orm/prisma-client/queries/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>

  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.medicamento`: Exposes CRUD operations for the **Medicamento** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Medicamentos
    * const medicamentos = await prisma.medicamento.findMany()
    * ```
    */
  get medicamento(): Prisma.MedicamentoDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.lote`: Exposes CRUD operations for the **Lote** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Lotes
    * const lotes = await prisma.lote.findMany()
    * ```
    */
  get lote(): Prisma.LoteDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.paciente`: Exposes CRUD operations for the **Paciente** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Pacientes
    * const pacientes = await prisma.paciente.findMany()
    * ```
    */
  get paciente(): Prisma.PacienteDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.prescricao`: Exposes CRUD operations for the **Prescricao** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Prescricaos
    * const prescricaos = await prisma.prescricao.findMany()
    * ```
    */
  get prescricao(): Prisma.PrescricaoDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.dispensacao`: Exposes CRUD operations for the **Dispensacao** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Dispensacaos
    * const dispensacaos = await prisma.dispensacao.findMany()
    * ```
    */
  get dispensacao(): Prisma.DispensacaoDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.dispensacaoItem`: Exposes CRUD operations for the **DispensacaoItem** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more DispensacaoItems
    * const dispensacaoItems = await prisma.dispensacaoItem.findMany()
    * ```
    */
  get dispensacaoItem(): Prisma.DispensacaoItemDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.embalageFracionada`: Exposes CRUD operations for the **EmbalageFracionada** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more EmbalageFracionadas
    * const embalageFracionadas = await prisma.embalageFracionada.findMany()
    * ```
    */
  get embalageFracionada(): Prisma.EmbalageFracionadaDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.movimentacaoFracionada`: Exposes CRUD operations for the **MovimentacaoFracionada** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more MovimentacaoFracionadas
    * const movimentacaoFracionadas = await prisma.movimentacaoFracionada.findMany()
    * ```
    */
  get movimentacaoFracionada(): Prisma.MovimentacaoFracionadaDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 7.8.0
   * Query Engine version: 3c6e192761c0362d496ed980de936e2f3cebcd3a
   */
  export type PrismaVersion = {
    client: string
    engine: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Medicamento: 'Medicamento',
    Lote: 'Lote',
    Paciente: 'Paciente',
    Prescricao: 'Prescricao',
    Dispensacao: 'Dispensacao',
    DispensacaoItem: 'DispensacaoItem',
    EmbalageFracionada: 'EmbalageFracionada',
    MovimentacaoFracionada: 'MovimentacaoFracionada'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]



  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "medicamento" | "lote" | "paciente" | "prescricao" | "dispensacao" | "dispensacaoItem" | "embalageFracionada" | "movimentacaoFracionada"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Medicamento: {
        payload: Prisma.$MedicamentoPayload<ExtArgs>
        fields: Prisma.MedicamentoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MedicamentoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MedicamentoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MedicamentoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MedicamentoPayload>
          }
          findFirst: {
            args: Prisma.MedicamentoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MedicamentoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MedicamentoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MedicamentoPayload>
          }
          findMany: {
            args: Prisma.MedicamentoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MedicamentoPayload>[]
          }
          create: {
            args: Prisma.MedicamentoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MedicamentoPayload>
          }
          createMany: {
            args: Prisma.MedicamentoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.MedicamentoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MedicamentoPayload>[]
          }
          delete: {
            args: Prisma.MedicamentoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MedicamentoPayload>
          }
          update: {
            args: Prisma.MedicamentoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MedicamentoPayload>
          }
          deleteMany: {
            args: Prisma.MedicamentoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MedicamentoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.MedicamentoUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MedicamentoPayload>[]
          }
          upsert: {
            args: Prisma.MedicamentoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MedicamentoPayload>
          }
          aggregate: {
            args: Prisma.MedicamentoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMedicamento>
          }
          groupBy: {
            args: Prisma.MedicamentoGroupByArgs<ExtArgs>
            result: $Utils.Optional<MedicamentoGroupByOutputType>[]
          }
          count: {
            args: Prisma.MedicamentoCountArgs<ExtArgs>
            result: $Utils.Optional<MedicamentoCountAggregateOutputType> | number
          }
        }
      }
      Lote: {
        payload: Prisma.$LotePayload<ExtArgs>
        fields: Prisma.LoteFieldRefs
        operations: {
          findUnique: {
            args: Prisma.LoteFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LotePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.LoteFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LotePayload>
          }
          findFirst: {
            args: Prisma.LoteFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LotePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.LoteFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LotePayload>
          }
          findMany: {
            args: Prisma.LoteFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LotePayload>[]
          }
          create: {
            args: Prisma.LoteCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LotePayload>
          }
          createMany: {
            args: Prisma.LoteCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.LoteCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LotePayload>[]
          }
          delete: {
            args: Prisma.LoteDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LotePayload>
          }
          update: {
            args: Prisma.LoteUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LotePayload>
          }
          deleteMany: {
            args: Prisma.LoteDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.LoteUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.LoteUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LotePayload>[]
          }
          upsert: {
            args: Prisma.LoteUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LotePayload>
          }
          aggregate: {
            args: Prisma.LoteAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateLote>
          }
          groupBy: {
            args: Prisma.LoteGroupByArgs<ExtArgs>
            result: $Utils.Optional<LoteGroupByOutputType>[]
          }
          count: {
            args: Prisma.LoteCountArgs<ExtArgs>
            result: $Utils.Optional<LoteCountAggregateOutputType> | number
          }
        }
      }
      Paciente: {
        payload: Prisma.$PacientePayload<ExtArgs>
        fields: Prisma.PacienteFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PacienteFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PacientePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PacienteFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PacientePayload>
          }
          findFirst: {
            args: Prisma.PacienteFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PacientePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PacienteFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PacientePayload>
          }
          findMany: {
            args: Prisma.PacienteFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PacientePayload>[]
          }
          create: {
            args: Prisma.PacienteCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PacientePayload>
          }
          createMany: {
            args: Prisma.PacienteCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PacienteCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PacientePayload>[]
          }
          delete: {
            args: Prisma.PacienteDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PacientePayload>
          }
          update: {
            args: Prisma.PacienteUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PacientePayload>
          }
          deleteMany: {
            args: Prisma.PacienteDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PacienteUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.PacienteUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PacientePayload>[]
          }
          upsert: {
            args: Prisma.PacienteUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PacientePayload>
          }
          aggregate: {
            args: Prisma.PacienteAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePaciente>
          }
          groupBy: {
            args: Prisma.PacienteGroupByArgs<ExtArgs>
            result: $Utils.Optional<PacienteGroupByOutputType>[]
          }
          count: {
            args: Prisma.PacienteCountArgs<ExtArgs>
            result: $Utils.Optional<PacienteCountAggregateOutputType> | number
          }
        }
      }
      Prescricao: {
        payload: Prisma.$PrescricaoPayload<ExtArgs>
        fields: Prisma.PrescricaoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PrescricaoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PrescricaoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PrescricaoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PrescricaoPayload>
          }
          findFirst: {
            args: Prisma.PrescricaoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PrescricaoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PrescricaoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PrescricaoPayload>
          }
          findMany: {
            args: Prisma.PrescricaoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PrescricaoPayload>[]
          }
          create: {
            args: Prisma.PrescricaoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PrescricaoPayload>
          }
          createMany: {
            args: Prisma.PrescricaoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PrescricaoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PrescricaoPayload>[]
          }
          delete: {
            args: Prisma.PrescricaoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PrescricaoPayload>
          }
          update: {
            args: Prisma.PrescricaoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PrescricaoPayload>
          }
          deleteMany: {
            args: Prisma.PrescricaoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PrescricaoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.PrescricaoUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PrescricaoPayload>[]
          }
          upsert: {
            args: Prisma.PrescricaoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PrescricaoPayload>
          }
          aggregate: {
            args: Prisma.PrescricaoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePrescricao>
          }
          groupBy: {
            args: Prisma.PrescricaoGroupByArgs<ExtArgs>
            result: $Utils.Optional<PrescricaoGroupByOutputType>[]
          }
          count: {
            args: Prisma.PrescricaoCountArgs<ExtArgs>
            result: $Utils.Optional<PrescricaoCountAggregateOutputType> | number
          }
        }
      }
      Dispensacao: {
        payload: Prisma.$DispensacaoPayload<ExtArgs>
        fields: Prisma.DispensacaoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DispensacaoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DispensacaoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DispensacaoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DispensacaoPayload>
          }
          findFirst: {
            args: Prisma.DispensacaoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DispensacaoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DispensacaoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DispensacaoPayload>
          }
          findMany: {
            args: Prisma.DispensacaoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DispensacaoPayload>[]
          }
          create: {
            args: Prisma.DispensacaoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DispensacaoPayload>
          }
          createMany: {
            args: Prisma.DispensacaoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DispensacaoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DispensacaoPayload>[]
          }
          delete: {
            args: Prisma.DispensacaoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DispensacaoPayload>
          }
          update: {
            args: Prisma.DispensacaoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DispensacaoPayload>
          }
          deleteMany: {
            args: Prisma.DispensacaoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DispensacaoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.DispensacaoUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DispensacaoPayload>[]
          }
          upsert: {
            args: Prisma.DispensacaoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DispensacaoPayload>
          }
          aggregate: {
            args: Prisma.DispensacaoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDispensacao>
          }
          groupBy: {
            args: Prisma.DispensacaoGroupByArgs<ExtArgs>
            result: $Utils.Optional<DispensacaoGroupByOutputType>[]
          }
          count: {
            args: Prisma.DispensacaoCountArgs<ExtArgs>
            result: $Utils.Optional<DispensacaoCountAggregateOutputType> | number
          }
        }
      }
      DispensacaoItem: {
        payload: Prisma.$DispensacaoItemPayload<ExtArgs>
        fields: Prisma.DispensacaoItemFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DispensacaoItemFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DispensacaoItemPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DispensacaoItemFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DispensacaoItemPayload>
          }
          findFirst: {
            args: Prisma.DispensacaoItemFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DispensacaoItemPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DispensacaoItemFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DispensacaoItemPayload>
          }
          findMany: {
            args: Prisma.DispensacaoItemFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DispensacaoItemPayload>[]
          }
          create: {
            args: Prisma.DispensacaoItemCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DispensacaoItemPayload>
          }
          createMany: {
            args: Prisma.DispensacaoItemCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DispensacaoItemCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DispensacaoItemPayload>[]
          }
          delete: {
            args: Prisma.DispensacaoItemDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DispensacaoItemPayload>
          }
          update: {
            args: Prisma.DispensacaoItemUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DispensacaoItemPayload>
          }
          deleteMany: {
            args: Prisma.DispensacaoItemDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DispensacaoItemUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.DispensacaoItemUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DispensacaoItemPayload>[]
          }
          upsert: {
            args: Prisma.DispensacaoItemUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DispensacaoItemPayload>
          }
          aggregate: {
            args: Prisma.DispensacaoItemAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDispensacaoItem>
          }
          groupBy: {
            args: Prisma.DispensacaoItemGroupByArgs<ExtArgs>
            result: $Utils.Optional<DispensacaoItemGroupByOutputType>[]
          }
          count: {
            args: Prisma.DispensacaoItemCountArgs<ExtArgs>
            result: $Utils.Optional<DispensacaoItemCountAggregateOutputType> | number
          }
        }
      }
      EmbalageFracionada: {
        payload: Prisma.$EmbalageFracionadaPayload<ExtArgs>
        fields: Prisma.EmbalageFracionadaFieldRefs
        operations: {
          findUnique: {
            args: Prisma.EmbalageFracionadaFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmbalageFracionadaPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.EmbalageFracionadaFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmbalageFracionadaPayload>
          }
          findFirst: {
            args: Prisma.EmbalageFracionadaFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmbalageFracionadaPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.EmbalageFracionadaFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmbalageFracionadaPayload>
          }
          findMany: {
            args: Prisma.EmbalageFracionadaFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmbalageFracionadaPayload>[]
          }
          create: {
            args: Prisma.EmbalageFracionadaCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmbalageFracionadaPayload>
          }
          createMany: {
            args: Prisma.EmbalageFracionadaCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.EmbalageFracionadaCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmbalageFracionadaPayload>[]
          }
          delete: {
            args: Prisma.EmbalageFracionadaDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmbalageFracionadaPayload>
          }
          update: {
            args: Prisma.EmbalageFracionadaUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmbalageFracionadaPayload>
          }
          deleteMany: {
            args: Prisma.EmbalageFracionadaDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.EmbalageFracionadaUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.EmbalageFracionadaUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmbalageFracionadaPayload>[]
          }
          upsert: {
            args: Prisma.EmbalageFracionadaUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmbalageFracionadaPayload>
          }
          aggregate: {
            args: Prisma.EmbalageFracionadaAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateEmbalageFracionada>
          }
          groupBy: {
            args: Prisma.EmbalageFracionadaGroupByArgs<ExtArgs>
            result: $Utils.Optional<EmbalageFracionadaGroupByOutputType>[]
          }
          count: {
            args: Prisma.EmbalageFracionadaCountArgs<ExtArgs>
            result: $Utils.Optional<EmbalageFracionadaCountAggregateOutputType> | number
          }
        }
      }
      MovimentacaoFracionada: {
        payload: Prisma.$MovimentacaoFracionadaPayload<ExtArgs>
        fields: Prisma.MovimentacaoFracionadaFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MovimentacaoFracionadaFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MovimentacaoFracionadaPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MovimentacaoFracionadaFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MovimentacaoFracionadaPayload>
          }
          findFirst: {
            args: Prisma.MovimentacaoFracionadaFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MovimentacaoFracionadaPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MovimentacaoFracionadaFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MovimentacaoFracionadaPayload>
          }
          findMany: {
            args: Prisma.MovimentacaoFracionadaFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MovimentacaoFracionadaPayload>[]
          }
          create: {
            args: Prisma.MovimentacaoFracionadaCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MovimentacaoFracionadaPayload>
          }
          createMany: {
            args: Prisma.MovimentacaoFracionadaCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.MovimentacaoFracionadaCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MovimentacaoFracionadaPayload>[]
          }
          delete: {
            args: Prisma.MovimentacaoFracionadaDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MovimentacaoFracionadaPayload>
          }
          update: {
            args: Prisma.MovimentacaoFracionadaUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MovimentacaoFracionadaPayload>
          }
          deleteMany: {
            args: Prisma.MovimentacaoFracionadaDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MovimentacaoFracionadaUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.MovimentacaoFracionadaUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MovimentacaoFracionadaPayload>[]
          }
          upsert: {
            args: Prisma.MovimentacaoFracionadaUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MovimentacaoFracionadaPayload>
          }
          aggregate: {
            args: Prisma.MovimentacaoFracionadaAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMovimentacaoFracionada>
          }
          groupBy: {
            args: Prisma.MovimentacaoFracionadaGroupByArgs<ExtArgs>
            result: $Utils.Optional<MovimentacaoFracionadaGroupByOutputType>[]
          }
          count: {
            args: Prisma.MovimentacaoFracionadaCountArgs<ExtArgs>
            result: $Utils.Optional<MovimentacaoFracionadaCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://pris.ly/d/logging).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory
    /**
     * Prisma Accelerate URL allowing the client to connect through Accelerate instead of a direct database.
     */
    accelerateUrl?: string
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
    /**
     * SQL commenter plugins that add metadata to SQL queries as comments.
     * Comments follow the sqlcommenter format: https://google.github.io/sqlcommenter/
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   adapter,
     *   comments: [
     *     traceContext(),
     *     queryInsights(),
     *   ],
     * })
     * ```
     */
    comments?: runtime.SqlCommenterPlugin[]
  }
  export type GlobalOmitConfig = {
    medicamento?: MedicamentoOmit
    lote?: LoteOmit
    paciente?: PacienteOmit
    prescricao?: PrescricaoOmit
    dispensacao?: DispensacaoOmit
    dispensacaoItem?: DispensacaoItemOmit
    embalageFracionada?: EmbalageFracionadaOmit
    movimentacaoFracionada?: MovimentacaoFracionadaOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type MedicamentoCountOutputType
   */

  export type MedicamentoCountOutputType = {
    lotes: number
    dispensacaoItens: number
    embalagensFracionadas: number
  }

  export type MedicamentoCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    lotes?: boolean | MedicamentoCountOutputTypeCountLotesArgs
    dispensacaoItens?: boolean | MedicamentoCountOutputTypeCountDispensacaoItensArgs
    embalagensFracionadas?: boolean | MedicamentoCountOutputTypeCountEmbalagensFracionadasArgs
  }

  // Custom InputTypes
  /**
   * MedicamentoCountOutputType without action
   */
  export type MedicamentoCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MedicamentoCountOutputType
     */
    select?: MedicamentoCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * MedicamentoCountOutputType without action
   */
  export type MedicamentoCountOutputTypeCountLotesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LoteWhereInput
  }

  /**
   * MedicamentoCountOutputType without action
   */
  export type MedicamentoCountOutputTypeCountDispensacaoItensArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DispensacaoItemWhereInput
  }

  /**
   * MedicamentoCountOutputType without action
   */
  export type MedicamentoCountOutputTypeCountEmbalagensFracionadasArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EmbalageFracionadaWhereInput
  }


  /**
   * Count Type LoteCountOutputType
   */

  export type LoteCountOutputType = {
    dispensacaoItens: number
    embalagensFracionadas: number
  }

  export type LoteCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    dispensacaoItens?: boolean | LoteCountOutputTypeCountDispensacaoItensArgs
    embalagensFracionadas?: boolean | LoteCountOutputTypeCountEmbalagensFracionadasArgs
  }

  // Custom InputTypes
  /**
   * LoteCountOutputType without action
   */
  export type LoteCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LoteCountOutputType
     */
    select?: LoteCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * LoteCountOutputType without action
   */
  export type LoteCountOutputTypeCountDispensacaoItensArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DispensacaoItemWhereInput
  }

  /**
   * LoteCountOutputType without action
   */
  export type LoteCountOutputTypeCountEmbalagensFracionadasArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EmbalageFracionadaWhereInput
  }


  /**
   * Count Type PacienteCountOutputType
   */

  export type PacienteCountOutputType = {
    prescricoes: number
    dispensacoes: number
  }

  export type PacienteCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    prescricoes?: boolean | PacienteCountOutputTypeCountPrescricoesArgs
    dispensacoes?: boolean | PacienteCountOutputTypeCountDispensacoesArgs
  }

  // Custom InputTypes
  /**
   * PacienteCountOutputType without action
   */
  export type PacienteCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PacienteCountOutputType
     */
    select?: PacienteCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * PacienteCountOutputType without action
   */
  export type PacienteCountOutputTypeCountPrescricoesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PrescricaoWhereInput
  }

  /**
   * PacienteCountOutputType without action
   */
  export type PacienteCountOutputTypeCountDispensacoesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DispensacaoWhereInput
  }


  /**
   * Count Type PrescricaoCountOutputType
   */

  export type PrescricaoCountOutputType = {
    dispensacoes: number
  }

  export type PrescricaoCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    dispensacoes?: boolean | PrescricaoCountOutputTypeCountDispensacoesArgs
  }

  // Custom InputTypes
  /**
   * PrescricaoCountOutputType without action
   */
  export type PrescricaoCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PrescricaoCountOutputType
     */
    select?: PrescricaoCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * PrescricaoCountOutputType without action
   */
  export type PrescricaoCountOutputTypeCountDispensacoesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DispensacaoWhereInput
  }


  /**
   * Count Type DispensacaoCountOutputType
   */

  export type DispensacaoCountOutputType = {
    itens: number
  }

  export type DispensacaoCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    itens?: boolean | DispensacaoCountOutputTypeCountItensArgs
  }

  // Custom InputTypes
  /**
   * DispensacaoCountOutputType without action
   */
  export type DispensacaoCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DispensacaoCountOutputType
     */
    select?: DispensacaoCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * DispensacaoCountOutputType without action
   */
  export type DispensacaoCountOutputTypeCountItensArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DispensacaoItemWhereInput
  }


  /**
   * Count Type EmbalageFracionadaCountOutputType
   */

  export type EmbalageFracionadaCountOutputType = {
    dispensacaoItens: number
    movimentacoes: number
  }

  export type EmbalageFracionadaCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    dispensacaoItens?: boolean | EmbalageFracionadaCountOutputTypeCountDispensacaoItensArgs
    movimentacoes?: boolean | EmbalageFracionadaCountOutputTypeCountMovimentacoesArgs
  }

  // Custom InputTypes
  /**
   * EmbalageFracionadaCountOutputType without action
   */
  export type EmbalageFracionadaCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmbalageFracionadaCountOutputType
     */
    select?: EmbalageFracionadaCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * EmbalageFracionadaCountOutputType without action
   */
  export type EmbalageFracionadaCountOutputTypeCountDispensacaoItensArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DispensacaoItemWhereInput
  }

  /**
   * EmbalageFracionadaCountOutputType without action
   */
  export type EmbalageFracionadaCountOutputTypeCountMovimentacoesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MovimentacaoFracionadaWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Medicamento
   */

  export type AggregateMedicamento = {
    _count: MedicamentoCountAggregateOutputType | null
    _avg: MedicamentoAvgAggregateOutputType | null
    _sum: MedicamentoSumAggregateOutputType | null
    _min: MedicamentoMinAggregateOutputType | null
    _max: MedicamentoMaxAggregateOutputType | null
  }

  export type MedicamentoAvgAggregateOutputType = {
    quantidadePorEmbalagem: number | null
    estoqueMinimo: number | null
  }

  export type MedicamentoSumAggregateOutputType = {
    quantidadePorEmbalagem: number | null
    estoqueMinimo: number | null
  }

  export type MedicamentoMinAggregateOutputType = {
    id: string | null
    catmatCodigo: string | null
    nome: string | null
    principioAtivo: string | null
    formaFarmaceutica: string | null
    concentracao: string | null
    unidadeMedida: string | null
    quantidadePorEmbalagem: number | null
    estoqueMinimo: number | null
    criadoEm: Date | null
    atualizadoEm: Date | null
    deletedAt: Date | null
  }

  export type MedicamentoMaxAggregateOutputType = {
    id: string | null
    catmatCodigo: string | null
    nome: string | null
    principioAtivo: string | null
    formaFarmaceutica: string | null
    concentracao: string | null
    unidadeMedida: string | null
    quantidadePorEmbalagem: number | null
    estoqueMinimo: number | null
    criadoEm: Date | null
    atualizadoEm: Date | null
    deletedAt: Date | null
  }

  export type MedicamentoCountAggregateOutputType = {
    id: number
    catmatCodigo: number
    nome: number
    principioAtivo: number
    formaFarmaceutica: number
    concentracao: number
    unidadeMedida: number
    quantidadePorEmbalagem: number
    estoqueMinimo: number
    criadoEm: number
    atualizadoEm: number
    deletedAt: number
    _all: number
  }


  export type MedicamentoAvgAggregateInputType = {
    quantidadePorEmbalagem?: true
    estoqueMinimo?: true
  }

  export type MedicamentoSumAggregateInputType = {
    quantidadePorEmbalagem?: true
    estoqueMinimo?: true
  }

  export type MedicamentoMinAggregateInputType = {
    id?: true
    catmatCodigo?: true
    nome?: true
    principioAtivo?: true
    formaFarmaceutica?: true
    concentracao?: true
    unidadeMedida?: true
    quantidadePorEmbalagem?: true
    estoqueMinimo?: true
    criadoEm?: true
    atualizadoEm?: true
    deletedAt?: true
  }

  export type MedicamentoMaxAggregateInputType = {
    id?: true
    catmatCodigo?: true
    nome?: true
    principioAtivo?: true
    formaFarmaceutica?: true
    concentracao?: true
    unidadeMedida?: true
    quantidadePorEmbalagem?: true
    estoqueMinimo?: true
    criadoEm?: true
    atualizadoEm?: true
    deletedAt?: true
  }

  export type MedicamentoCountAggregateInputType = {
    id?: true
    catmatCodigo?: true
    nome?: true
    principioAtivo?: true
    formaFarmaceutica?: true
    concentracao?: true
    unidadeMedida?: true
    quantidadePorEmbalagem?: true
    estoqueMinimo?: true
    criadoEm?: true
    atualizadoEm?: true
    deletedAt?: true
    _all?: true
  }

  export type MedicamentoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Medicamento to aggregate.
     */
    where?: MedicamentoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Medicamentos to fetch.
     */
    orderBy?: MedicamentoOrderByWithRelationInput | MedicamentoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MedicamentoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Medicamentos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Medicamentos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Medicamentos
    **/
    _count?: true | MedicamentoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: MedicamentoAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: MedicamentoSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MedicamentoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MedicamentoMaxAggregateInputType
  }

  export type GetMedicamentoAggregateType<T extends MedicamentoAggregateArgs> = {
        [P in keyof T & keyof AggregateMedicamento]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMedicamento[P]>
      : GetScalarType<T[P], AggregateMedicamento[P]>
  }




  export type MedicamentoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MedicamentoWhereInput
    orderBy?: MedicamentoOrderByWithAggregationInput | MedicamentoOrderByWithAggregationInput[]
    by: MedicamentoScalarFieldEnum[] | MedicamentoScalarFieldEnum
    having?: MedicamentoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MedicamentoCountAggregateInputType | true
    _avg?: MedicamentoAvgAggregateInputType
    _sum?: MedicamentoSumAggregateInputType
    _min?: MedicamentoMinAggregateInputType
    _max?: MedicamentoMaxAggregateInputType
  }

  export type MedicamentoGroupByOutputType = {
    id: string
    catmatCodigo: string | null
    nome: string
    principioAtivo: string | null
    formaFarmaceutica: string | null
    concentracao: string | null
    unidadeMedida: string
    quantidadePorEmbalagem: number
    estoqueMinimo: number
    criadoEm: Date
    atualizadoEm: Date
    deletedAt: Date | null
    _count: MedicamentoCountAggregateOutputType | null
    _avg: MedicamentoAvgAggregateOutputType | null
    _sum: MedicamentoSumAggregateOutputType | null
    _min: MedicamentoMinAggregateOutputType | null
    _max: MedicamentoMaxAggregateOutputType | null
  }

  type GetMedicamentoGroupByPayload<T extends MedicamentoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MedicamentoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MedicamentoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MedicamentoGroupByOutputType[P]>
            : GetScalarType<T[P], MedicamentoGroupByOutputType[P]>
        }
      >
    >


  export type MedicamentoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    catmatCodigo?: boolean
    nome?: boolean
    principioAtivo?: boolean
    formaFarmaceutica?: boolean
    concentracao?: boolean
    unidadeMedida?: boolean
    quantidadePorEmbalagem?: boolean
    estoqueMinimo?: boolean
    criadoEm?: boolean
    atualizadoEm?: boolean
    deletedAt?: boolean
    lotes?: boolean | Medicamento$lotesArgs<ExtArgs>
    dispensacaoItens?: boolean | Medicamento$dispensacaoItensArgs<ExtArgs>
    embalagensFracionadas?: boolean | Medicamento$embalagensFracionadasArgs<ExtArgs>
    _count?: boolean | MedicamentoCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["medicamento"]>

  export type MedicamentoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    catmatCodigo?: boolean
    nome?: boolean
    principioAtivo?: boolean
    formaFarmaceutica?: boolean
    concentracao?: boolean
    unidadeMedida?: boolean
    quantidadePorEmbalagem?: boolean
    estoqueMinimo?: boolean
    criadoEm?: boolean
    atualizadoEm?: boolean
    deletedAt?: boolean
  }, ExtArgs["result"]["medicamento"]>

  export type MedicamentoSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    catmatCodigo?: boolean
    nome?: boolean
    principioAtivo?: boolean
    formaFarmaceutica?: boolean
    concentracao?: boolean
    unidadeMedida?: boolean
    quantidadePorEmbalagem?: boolean
    estoqueMinimo?: boolean
    criadoEm?: boolean
    atualizadoEm?: boolean
    deletedAt?: boolean
  }, ExtArgs["result"]["medicamento"]>

  export type MedicamentoSelectScalar = {
    id?: boolean
    catmatCodigo?: boolean
    nome?: boolean
    principioAtivo?: boolean
    formaFarmaceutica?: boolean
    concentracao?: boolean
    unidadeMedida?: boolean
    quantidadePorEmbalagem?: boolean
    estoqueMinimo?: boolean
    criadoEm?: boolean
    atualizadoEm?: boolean
    deletedAt?: boolean
  }

  export type MedicamentoOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "catmatCodigo" | "nome" | "principioAtivo" | "formaFarmaceutica" | "concentracao" | "unidadeMedida" | "quantidadePorEmbalagem" | "estoqueMinimo" | "criadoEm" | "atualizadoEm" | "deletedAt", ExtArgs["result"]["medicamento"]>
  export type MedicamentoInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    lotes?: boolean | Medicamento$lotesArgs<ExtArgs>
    dispensacaoItens?: boolean | Medicamento$dispensacaoItensArgs<ExtArgs>
    embalagensFracionadas?: boolean | Medicamento$embalagensFracionadasArgs<ExtArgs>
    _count?: boolean | MedicamentoCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type MedicamentoIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type MedicamentoIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $MedicamentoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Medicamento"
    objects: {
      lotes: Prisma.$LotePayload<ExtArgs>[]
      dispensacaoItens: Prisma.$DispensacaoItemPayload<ExtArgs>[]
      embalagensFracionadas: Prisma.$EmbalageFracionadaPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      catmatCodigo: string | null
      nome: string
      principioAtivo: string | null
      formaFarmaceutica: string | null
      concentracao: string | null
      unidadeMedida: string
      quantidadePorEmbalagem: number
      estoqueMinimo: number
      criadoEm: Date
      atualizadoEm: Date
      deletedAt: Date | null
    }, ExtArgs["result"]["medicamento"]>
    composites: {}
  }

  type MedicamentoGetPayload<S extends boolean | null | undefined | MedicamentoDefaultArgs> = $Result.GetResult<Prisma.$MedicamentoPayload, S>

  type MedicamentoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<MedicamentoFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: MedicamentoCountAggregateInputType | true
    }

  export interface MedicamentoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Medicamento'], meta: { name: 'Medicamento' } }
    /**
     * Find zero or one Medicamento that matches the filter.
     * @param {MedicamentoFindUniqueArgs} args - Arguments to find a Medicamento
     * @example
     * // Get one Medicamento
     * const medicamento = await prisma.medicamento.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MedicamentoFindUniqueArgs>(args: SelectSubset<T, MedicamentoFindUniqueArgs<ExtArgs>>): Prisma__MedicamentoClient<$Result.GetResult<Prisma.$MedicamentoPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Medicamento that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {MedicamentoFindUniqueOrThrowArgs} args - Arguments to find a Medicamento
     * @example
     * // Get one Medicamento
     * const medicamento = await prisma.medicamento.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MedicamentoFindUniqueOrThrowArgs>(args: SelectSubset<T, MedicamentoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MedicamentoClient<$Result.GetResult<Prisma.$MedicamentoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Medicamento that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MedicamentoFindFirstArgs} args - Arguments to find a Medicamento
     * @example
     * // Get one Medicamento
     * const medicamento = await prisma.medicamento.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MedicamentoFindFirstArgs>(args?: SelectSubset<T, MedicamentoFindFirstArgs<ExtArgs>>): Prisma__MedicamentoClient<$Result.GetResult<Prisma.$MedicamentoPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Medicamento that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MedicamentoFindFirstOrThrowArgs} args - Arguments to find a Medicamento
     * @example
     * // Get one Medicamento
     * const medicamento = await prisma.medicamento.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MedicamentoFindFirstOrThrowArgs>(args?: SelectSubset<T, MedicamentoFindFirstOrThrowArgs<ExtArgs>>): Prisma__MedicamentoClient<$Result.GetResult<Prisma.$MedicamentoPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Medicamentos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MedicamentoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Medicamentos
     * const medicamentos = await prisma.medicamento.findMany()
     * 
     * // Get first 10 Medicamentos
     * const medicamentos = await prisma.medicamento.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const medicamentoWithIdOnly = await prisma.medicamento.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends MedicamentoFindManyArgs>(args?: SelectSubset<T, MedicamentoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MedicamentoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Medicamento.
     * @param {MedicamentoCreateArgs} args - Arguments to create a Medicamento.
     * @example
     * // Create one Medicamento
     * const Medicamento = await prisma.medicamento.create({
     *   data: {
     *     // ... data to create a Medicamento
     *   }
     * })
     * 
     */
    create<T extends MedicamentoCreateArgs>(args: SelectSubset<T, MedicamentoCreateArgs<ExtArgs>>): Prisma__MedicamentoClient<$Result.GetResult<Prisma.$MedicamentoPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Medicamentos.
     * @param {MedicamentoCreateManyArgs} args - Arguments to create many Medicamentos.
     * @example
     * // Create many Medicamentos
     * const medicamento = await prisma.medicamento.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MedicamentoCreateManyArgs>(args?: SelectSubset<T, MedicamentoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Medicamentos and returns the data saved in the database.
     * @param {MedicamentoCreateManyAndReturnArgs} args - Arguments to create many Medicamentos.
     * @example
     * // Create many Medicamentos
     * const medicamento = await prisma.medicamento.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Medicamentos and only return the `id`
     * const medicamentoWithIdOnly = await prisma.medicamento.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends MedicamentoCreateManyAndReturnArgs>(args?: SelectSubset<T, MedicamentoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MedicamentoPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Medicamento.
     * @param {MedicamentoDeleteArgs} args - Arguments to delete one Medicamento.
     * @example
     * // Delete one Medicamento
     * const Medicamento = await prisma.medicamento.delete({
     *   where: {
     *     // ... filter to delete one Medicamento
     *   }
     * })
     * 
     */
    delete<T extends MedicamentoDeleteArgs>(args: SelectSubset<T, MedicamentoDeleteArgs<ExtArgs>>): Prisma__MedicamentoClient<$Result.GetResult<Prisma.$MedicamentoPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Medicamento.
     * @param {MedicamentoUpdateArgs} args - Arguments to update one Medicamento.
     * @example
     * // Update one Medicamento
     * const medicamento = await prisma.medicamento.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MedicamentoUpdateArgs>(args: SelectSubset<T, MedicamentoUpdateArgs<ExtArgs>>): Prisma__MedicamentoClient<$Result.GetResult<Prisma.$MedicamentoPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Medicamentos.
     * @param {MedicamentoDeleteManyArgs} args - Arguments to filter Medicamentos to delete.
     * @example
     * // Delete a few Medicamentos
     * const { count } = await prisma.medicamento.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MedicamentoDeleteManyArgs>(args?: SelectSubset<T, MedicamentoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Medicamentos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MedicamentoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Medicamentos
     * const medicamento = await prisma.medicamento.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MedicamentoUpdateManyArgs>(args: SelectSubset<T, MedicamentoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Medicamentos and returns the data updated in the database.
     * @param {MedicamentoUpdateManyAndReturnArgs} args - Arguments to update many Medicamentos.
     * @example
     * // Update many Medicamentos
     * const medicamento = await prisma.medicamento.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Medicamentos and only return the `id`
     * const medicamentoWithIdOnly = await prisma.medicamento.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends MedicamentoUpdateManyAndReturnArgs>(args: SelectSubset<T, MedicamentoUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MedicamentoPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Medicamento.
     * @param {MedicamentoUpsertArgs} args - Arguments to update or create a Medicamento.
     * @example
     * // Update or create a Medicamento
     * const medicamento = await prisma.medicamento.upsert({
     *   create: {
     *     // ... data to create a Medicamento
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Medicamento we want to update
     *   }
     * })
     */
    upsert<T extends MedicamentoUpsertArgs>(args: SelectSubset<T, MedicamentoUpsertArgs<ExtArgs>>): Prisma__MedicamentoClient<$Result.GetResult<Prisma.$MedicamentoPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Medicamentos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MedicamentoCountArgs} args - Arguments to filter Medicamentos to count.
     * @example
     * // Count the number of Medicamentos
     * const count = await prisma.medicamento.count({
     *   where: {
     *     // ... the filter for the Medicamentos we want to count
     *   }
     * })
    **/
    count<T extends MedicamentoCountArgs>(
      args?: Subset<T, MedicamentoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MedicamentoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Medicamento.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MedicamentoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MedicamentoAggregateArgs>(args: Subset<T, MedicamentoAggregateArgs>): Prisma.PrismaPromise<GetMedicamentoAggregateType<T>>

    /**
     * Group by Medicamento.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MedicamentoGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends MedicamentoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MedicamentoGroupByArgs['orderBy'] }
        : { orderBy?: MedicamentoGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, MedicamentoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMedicamentoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Medicamento model
   */
  readonly fields: MedicamentoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Medicamento.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MedicamentoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    lotes<T extends Medicamento$lotesArgs<ExtArgs> = {}>(args?: Subset<T, Medicamento$lotesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LotePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    dispensacaoItens<T extends Medicamento$dispensacaoItensArgs<ExtArgs> = {}>(args?: Subset<T, Medicamento$dispensacaoItensArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DispensacaoItemPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    embalagensFracionadas<T extends Medicamento$embalagensFracionadasArgs<ExtArgs> = {}>(args?: Subset<T, Medicamento$embalagensFracionadasArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EmbalageFracionadaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Medicamento model
   */
  interface MedicamentoFieldRefs {
    readonly id: FieldRef<"Medicamento", 'String'>
    readonly catmatCodigo: FieldRef<"Medicamento", 'String'>
    readonly nome: FieldRef<"Medicamento", 'String'>
    readonly principioAtivo: FieldRef<"Medicamento", 'String'>
    readonly formaFarmaceutica: FieldRef<"Medicamento", 'String'>
    readonly concentracao: FieldRef<"Medicamento", 'String'>
    readonly unidadeMedida: FieldRef<"Medicamento", 'String'>
    readonly quantidadePorEmbalagem: FieldRef<"Medicamento", 'Int'>
    readonly estoqueMinimo: FieldRef<"Medicamento", 'Int'>
    readonly criadoEm: FieldRef<"Medicamento", 'DateTime'>
    readonly atualizadoEm: FieldRef<"Medicamento", 'DateTime'>
    readonly deletedAt: FieldRef<"Medicamento", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Medicamento findUnique
   */
  export type MedicamentoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Medicamento
     */
    select?: MedicamentoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Medicamento
     */
    omit?: MedicamentoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MedicamentoInclude<ExtArgs> | null
    /**
     * Filter, which Medicamento to fetch.
     */
    where: MedicamentoWhereUniqueInput
  }

  /**
   * Medicamento findUniqueOrThrow
   */
  export type MedicamentoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Medicamento
     */
    select?: MedicamentoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Medicamento
     */
    omit?: MedicamentoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MedicamentoInclude<ExtArgs> | null
    /**
     * Filter, which Medicamento to fetch.
     */
    where: MedicamentoWhereUniqueInput
  }

  /**
   * Medicamento findFirst
   */
  export type MedicamentoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Medicamento
     */
    select?: MedicamentoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Medicamento
     */
    omit?: MedicamentoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MedicamentoInclude<ExtArgs> | null
    /**
     * Filter, which Medicamento to fetch.
     */
    where?: MedicamentoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Medicamentos to fetch.
     */
    orderBy?: MedicamentoOrderByWithRelationInput | MedicamentoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Medicamentos.
     */
    cursor?: MedicamentoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Medicamentos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Medicamentos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Medicamentos.
     */
    distinct?: MedicamentoScalarFieldEnum | MedicamentoScalarFieldEnum[]
  }

  /**
   * Medicamento findFirstOrThrow
   */
  export type MedicamentoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Medicamento
     */
    select?: MedicamentoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Medicamento
     */
    omit?: MedicamentoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MedicamentoInclude<ExtArgs> | null
    /**
     * Filter, which Medicamento to fetch.
     */
    where?: MedicamentoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Medicamentos to fetch.
     */
    orderBy?: MedicamentoOrderByWithRelationInput | MedicamentoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Medicamentos.
     */
    cursor?: MedicamentoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Medicamentos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Medicamentos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Medicamentos.
     */
    distinct?: MedicamentoScalarFieldEnum | MedicamentoScalarFieldEnum[]
  }

  /**
   * Medicamento findMany
   */
  export type MedicamentoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Medicamento
     */
    select?: MedicamentoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Medicamento
     */
    omit?: MedicamentoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MedicamentoInclude<ExtArgs> | null
    /**
     * Filter, which Medicamentos to fetch.
     */
    where?: MedicamentoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Medicamentos to fetch.
     */
    orderBy?: MedicamentoOrderByWithRelationInput | MedicamentoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Medicamentos.
     */
    cursor?: MedicamentoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Medicamentos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Medicamentos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Medicamentos.
     */
    distinct?: MedicamentoScalarFieldEnum | MedicamentoScalarFieldEnum[]
  }

  /**
   * Medicamento create
   */
  export type MedicamentoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Medicamento
     */
    select?: MedicamentoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Medicamento
     */
    omit?: MedicamentoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MedicamentoInclude<ExtArgs> | null
    /**
     * The data needed to create a Medicamento.
     */
    data: XOR<MedicamentoCreateInput, MedicamentoUncheckedCreateInput>
  }

  /**
   * Medicamento createMany
   */
  export type MedicamentoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Medicamentos.
     */
    data: MedicamentoCreateManyInput | MedicamentoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Medicamento createManyAndReturn
   */
  export type MedicamentoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Medicamento
     */
    select?: MedicamentoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Medicamento
     */
    omit?: MedicamentoOmit<ExtArgs> | null
    /**
     * The data used to create many Medicamentos.
     */
    data: MedicamentoCreateManyInput | MedicamentoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Medicamento update
   */
  export type MedicamentoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Medicamento
     */
    select?: MedicamentoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Medicamento
     */
    omit?: MedicamentoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MedicamentoInclude<ExtArgs> | null
    /**
     * The data needed to update a Medicamento.
     */
    data: XOR<MedicamentoUpdateInput, MedicamentoUncheckedUpdateInput>
    /**
     * Choose, which Medicamento to update.
     */
    where: MedicamentoWhereUniqueInput
  }

  /**
   * Medicamento updateMany
   */
  export type MedicamentoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Medicamentos.
     */
    data: XOR<MedicamentoUpdateManyMutationInput, MedicamentoUncheckedUpdateManyInput>
    /**
     * Filter which Medicamentos to update
     */
    where?: MedicamentoWhereInput
    /**
     * Limit how many Medicamentos to update.
     */
    limit?: number
  }

  /**
   * Medicamento updateManyAndReturn
   */
  export type MedicamentoUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Medicamento
     */
    select?: MedicamentoSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Medicamento
     */
    omit?: MedicamentoOmit<ExtArgs> | null
    /**
     * The data used to update Medicamentos.
     */
    data: XOR<MedicamentoUpdateManyMutationInput, MedicamentoUncheckedUpdateManyInput>
    /**
     * Filter which Medicamentos to update
     */
    where?: MedicamentoWhereInput
    /**
     * Limit how many Medicamentos to update.
     */
    limit?: number
  }

  /**
   * Medicamento upsert
   */
  export type MedicamentoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Medicamento
     */
    select?: MedicamentoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Medicamento
     */
    omit?: MedicamentoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MedicamentoInclude<ExtArgs> | null
    /**
     * The filter to search for the Medicamento to update in case it exists.
     */
    where: MedicamentoWhereUniqueInput
    /**
     * In case the Medicamento found by the `where` argument doesn't exist, create a new Medicamento with this data.
     */
    create: XOR<MedicamentoCreateInput, MedicamentoUncheckedCreateInput>
    /**
     * In case the Medicamento was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MedicamentoUpdateInput, MedicamentoUncheckedUpdateInput>
  }

  /**
   * Medicamento delete
   */
  export type MedicamentoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Medicamento
     */
    select?: MedicamentoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Medicamento
     */
    omit?: MedicamentoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MedicamentoInclude<ExtArgs> | null
    /**
     * Filter which Medicamento to delete.
     */
    where: MedicamentoWhereUniqueInput
  }

  /**
   * Medicamento deleteMany
   */
  export type MedicamentoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Medicamentos to delete
     */
    where?: MedicamentoWhereInput
    /**
     * Limit how many Medicamentos to delete.
     */
    limit?: number
  }

  /**
   * Medicamento.lotes
   */
  export type Medicamento$lotesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lote
     */
    select?: LoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Lote
     */
    omit?: LoteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LoteInclude<ExtArgs> | null
    where?: LoteWhereInput
    orderBy?: LoteOrderByWithRelationInput | LoteOrderByWithRelationInput[]
    cursor?: LoteWhereUniqueInput
    take?: number
    skip?: number
    distinct?: LoteScalarFieldEnum | LoteScalarFieldEnum[]
  }

  /**
   * Medicamento.dispensacaoItens
   */
  export type Medicamento$dispensacaoItensArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DispensacaoItem
     */
    select?: DispensacaoItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DispensacaoItem
     */
    omit?: DispensacaoItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DispensacaoItemInclude<ExtArgs> | null
    where?: DispensacaoItemWhereInput
    orderBy?: DispensacaoItemOrderByWithRelationInput | DispensacaoItemOrderByWithRelationInput[]
    cursor?: DispensacaoItemWhereUniqueInput
    take?: number
    skip?: number
    distinct?: DispensacaoItemScalarFieldEnum | DispensacaoItemScalarFieldEnum[]
  }

  /**
   * Medicamento.embalagensFracionadas
   */
  export type Medicamento$embalagensFracionadasArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmbalageFracionada
     */
    select?: EmbalageFracionadaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmbalageFracionada
     */
    omit?: EmbalageFracionadaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmbalageFracionadaInclude<ExtArgs> | null
    where?: EmbalageFracionadaWhereInput
    orderBy?: EmbalageFracionadaOrderByWithRelationInput | EmbalageFracionadaOrderByWithRelationInput[]
    cursor?: EmbalageFracionadaWhereUniqueInput
    take?: number
    skip?: number
    distinct?: EmbalageFracionadaScalarFieldEnum | EmbalageFracionadaScalarFieldEnum[]
  }

  /**
   * Medicamento without action
   */
  export type MedicamentoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Medicamento
     */
    select?: MedicamentoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Medicamento
     */
    omit?: MedicamentoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MedicamentoInclude<ExtArgs> | null
  }


  /**
   * Model Lote
   */

  export type AggregateLote = {
    _count: LoteCountAggregateOutputType | null
    _avg: LoteAvgAggregateOutputType | null
    _sum: LoteSumAggregateOutputType | null
    _min: LoteMinAggregateOutputType | null
    _max: LoteMaxAggregateOutputType | null
  }

  export type LoteAvgAggregateOutputType = {
    quantidade: number | null
    quantidadeAtual: number | null
    quantidadeCaixasFechadas: number | null
    quantidadePorCaixa: number | null
  }

  export type LoteSumAggregateOutputType = {
    quantidade: number | null
    quantidadeAtual: number | null
    quantidadeCaixasFechadas: number | null
    quantidadePorCaixa: number | null
  }

  export type LoteMinAggregateOutputType = {
    id: string | null
    medicamentoId: string | null
    numeroLote: string | null
    quantidade: number | null
    quantidadeAtual: number | null
    quantidadeCaixasFechadas: number | null
    quantidadePorCaixa: number | null
    validade: Date | null
    fornecedor: string | null
    notaFiscal: string | null
    criadoEm: Date | null
    deletedAt: Date | null
  }

  export type LoteMaxAggregateOutputType = {
    id: string | null
    medicamentoId: string | null
    numeroLote: string | null
    quantidade: number | null
    quantidadeAtual: number | null
    quantidadeCaixasFechadas: number | null
    quantidadePorCaixa: number | null
    validade: Date | null
    fornecedor: string | null
    notaFiscal: string | null
    criadoEm: Date | null
    deletedAt: Date | null
  }

  export type LoteCountAggregateOutputType = {
    id: number
    medicamentoId: number
    numeroLote: number
    quantidade: number
    quantidadeAtual: number
    quantidadeCaixasFechadas: number
    quantidadePorCaixa: number
    validade: number
    fornecedor: number
    notaFiscal: number
    criadoEm: number
    deletedAt: number
    _all: number
  }


  export type LoteAvgAggregateInputType = {
    quantidade?: true
    quantidadeAtual?: true
    quantidadeCaixasFechadas?: true
    quantidadePorCaixa?: true
  }

  export type LoteSumAggregateInputType = {
    quantidade?: true
    quantidadeAtual?: true
    quantidadeCaixasFechadas?: true
    quantidadePorCaixa?: true
  }

  export type LoteMinAggregateInputType = {
    id?: true
    medicamentoId?: true
    numeroLote?: true
    quantidade?: true
    quantidadeAtual?: true
    quantidadeCaixasFechadas?: true
    quantidadePorCaixa?: true
    validade?: true
    fornecedor?: true
    notaFiscal?: true
    criadoEm?: true
    deletedAt?: true
  }

  export type LoteMaxAggregateInputType = {
    id?: true
    medicamentoId?: true
    numeroLote?: true
    quantidade?: true
    quantidadeAtual?: true
    quantidadeCaixasFechadas?: true
    quantidadePorCaixa?: true
    validade?: true
    fornecedor?: true
    notaFiscal?: true
    criadoEm?: true
    deletedAt?: true
  }

  export type LoteCountAggregateInputType = {
    id?: true
    medicamentoId?: true
    numeroLote?: true
    quantidade?: true
    quantidadeAtual?: true
    quantidadeCaixasFechadas?: true
    quantidadePorCaixa?: true
    validade?: true
    fornecedor?: true
    notaFiscal?: true
    criadoEm?: true
    deletedAt?: true
    _all?: true
  }

  export type LoteAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Lote to aggregate.
     */
    where?: LoteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Lotes to fetch.
     */
    orderBy?: LoteOrderByWithRelationInput | LoteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: LoteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Lotes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Lotes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Lotes
    **/
    _count?: true | LoteCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: LoteAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: LoteSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: LoteMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: LoteMaxAggregateInputType
  }

  export type GetLoteAggregateType<T extends LoteAggregateArgs> = {
        [P in keyof T & keyof AggregateLote]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateLote[P]>
      : GetScalarType<T[P], AggregateLote[P]>
  }




  export type LoteGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LoteWhereInput
    orderBy?: LoteOrderByWithAggregationInput | LoteOrderByWithAggregationInput[]
    by: LoteScalarFieldEnum[] | LoteScalarFieldEnum
    having?: LoteScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: LoteCountAggregateInputType | true
    _avg?: LoteAvgAggregateInputType
    _sum?: LoteSumAggregateInputType
    _min?: LoteMinAggregateInputType
    _max?: LoteMaxAggregateInputType
  }

  export type LoteGroupByOutputType = {
    id: string
    medicamentoId: string
    numeroLote: string
    quantidade: number
    quantidadeAtual: number
    quantidadeCaixasFechadas: number
    quantidadePorCaixa: number
    validade: Date
    fornecedor: string | null
    notaFiscal: string | null
    criadoEm: Date
    deletedAt: Date | null
    _count: LoteCountAggregateOutputType | null
    _avg: LoteAvgAggregateOutputType | null
    _sum: LoteSumAggregateOutputType | null
    _min: LoteMinAggregateOutputType | null
    _max: LoteMaxAggregateOutputType | null
  }

  type GetLoteGroupByPayload<T extends LoteGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<LoteGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof LoteGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], LoteGroupByOutputType[P]>
            : GetScalarType<T[P], LoteGroupByOutputType[P]>
        }
      >
    >


  export type LoteSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    medicamentoId?: boolean
    numeroLote?: boolean
    quantidade?: boolean
    quantidadeAtual?: boolean
    quantidadeCaixasFechadas?: boolean
    quantidadePorCaixa?: boolean
    validade?: boolean
    fornecedor?: boolean
    notaFiscal?: boolean
    criadoEm?: boolean
    deletedAt?: boolean
    medicamento?: boolean | MedicamentoDefaultArgs<ExtArgs>
    dispensacaoItens?: boolean | Lote$dispensacaoItensArgs<ExtArgs>
    embalagensFracionadas?: boolean | Lote$embalagensFracionadasArgs<ExtArgs>
    _count?: boolean | LoteCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["lote"]>

  export type LoteSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    medicamentoId?: boolean
    numeroLote?: boolean
    quantidade?: boolean
    quantidadeAtual?: boolean
    quantidadeCaixasFechadas?: boolean
    quantidadePorCaixa?: boolean
    validade?: boolean
    fornecedor?: boolean
    notaFiscal?: boolean
    criadoEm?: boolean
    deletedAt?: boolean
    medicamento?: boolean | MedicamentoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["lote"]>

  export type LoteSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    medicamentoId?: boolean
    numeroLote?: boolean
    quantidade?: boolean
    quantidadeAtual?: boolean
    quantidadeCaixasFechadas?: boolean
    quantidadePorCaixa?: boolean
    validade?: boolean
    fornecedor?: boolean
    notaFiscal?: boolean
    criadoEm?: boolean
    deletedAt?: boolean
    medicamento?: boolean | MedicamentoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["lote"]>

  export type LoteSelectScalar = {
    id?: boolean
    medicamentoId?: boolean
    numeroLote?: boolean
    quantidade?: boolean
    quantidadeAtual?: boolean
    quantidadeCaixasFechadas?: boolean
    quantidadePorCaixa?: boolean
    validade?: boolean
    fornecedor?: boolean
    notaFiscal?: boolean
    criadoEm?: boolean
    deletedAt?: boolean
  }

  export type LoteOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "medicamentoId" | "numeroLote" | "quantidade" | "quantidadeAtual" | "quantidadeCaixasFechadas" | "quantidadePorCaixa" | "validade" | "fornecedor" | "notaFiscal" | "criadoEm" | "deletedAt", ExtArgs["result"]["lote"]>
  export type LoteInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    medicamento?: boolean | MedicamentoDefaultArgs<ExtArgs>
    dispensacaoItens?: boolean | Lote$dispensacaoItensArgs<ExtArgs>
    embalagensFracionadas?: boolean | Lote$embalagensFracionadasArgs<ExtArgs>
    _count?: boolean | LoteCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type LoteIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    medicamento?: boolean | MedicamentoDefaultArgs<ExtArgs>
  }
  export type LoteIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    medicamento?: boolean | MedicamentoDefaultArgs<ExtArgs>
  }

  export type $LotePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Lote"
    objects: {
      medicamento: Prisma.$MedicamentoPayload<ExtArgs>
      dispensacaoItens: Prisma.$DispensacaoItemPayload<ExtArgs>[]
      embalagensFracionadas: Prisma.$EmbalageFracionadaPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      medicamentoId: string
      numeroLote: string
      quantidade: number
      quantidadeAtual: number
      quantidadeCaixasFechadas: number
      quantidadePorCaixa: number
      validade: Date
      fornecedor: string | null
      notaFiscal: string | null
      criadoEm: Date
      deletedAt: Date | null
    }, ExtArgs["result"]["lote"]>
    composites: {}
  }

  type LoteGetPayload<S extends boolean | null | undefined | LoteDefaultArgs> = $Result.GetResult<Prisma.$LotePayload, S>

  type LoteCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<LoteFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: LoteCountAggregateInputType | true
    }

  export interface LoteDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Lote'], meta: { name: 'Lote' } }
    /**
     * Find zero or one Lote that matches the filter.
     * @param {LoteFindUniqueArgs} args - Arguments to find a Lote
     * @example
     * // Get one Lote
     * const lote = await prisma.lote.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends LoteFindUniqueArgs>(args: SelectSubset<T, LoteFindUniqueArgs<ExtArgs>>): Prisma__LoteClient<$Result.GetResult<Prisma.$LotePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Lote that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {LoteFindUniqueOrThrowArgs} args - Arguments to find a Lote
     * @example
     * // Get one Lote
     * const lote = await prisma.lote.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends LoteFindUniqueOrThrowArgs>(args: SelectSubset<T, LoteFindUniqueOrThrowArgs<ExtArgs>>): Prisma__LoteClient<$Result.GetResult<Prisma.$LotePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Lote that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LoteFindFirstArgs} args - Arguments to find a Lote
     * @example
     * // Get one Lote
     * const lote = await prisma.lote.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends LoteFindFirstArgs>(args?: SelectSubset<T, LoteFindFirstArgs<ExtArgs>>): Prisma__LoteClient<$Result.GetResult<Prisma.$LotePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Lote that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LoteFindFirstOrThrowArgs} args - Arguments to find a Lote
     * @example
     * // Get one Lote
     * const lote = await prisma.lote.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends LoteFindFirstOrThrowArgs>(args?: SelectSubset<T, LoteFindFirstOrThrowArgs<ExtArgs>>): Prisma__LoteClient<$Result.GetResult<Prisma.$LotePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Lotes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LoteFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Lotes
     * const lotes = await prisma.lote.findMany()
     * 
     * // Get first 10 Lotes
     * const lotes = await prisma.lote.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const loteWithIdOnly = await prisma.lote.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends LoteFindManyArgs>(args?: SelectSubset<T, LoteFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LotePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Lote.
     * @param {LoteCreateArgs} args - Arguments to create a Lote.
     * @example
     * // Create one Lote
     * const Lote = await prisma.lote.create({
     *   data: {
     *     // ... data to create a Lote
     *   }
     * })
     * 
     */
    create<T extends LoteCreateArgs>(args: SelectSubset<T, LoteCreateArgs<ExtArgs>>): Prisma__LoteClient<$Result.GetResult<Prisma.$LotePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Lotes.
     * @param {LoteCreateManyArgs} args - Arguments to create many Lotes.
     * @example
     * // Create many Lotes
     * const lote = await prisma.lote.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends LoteCreateManyArgs>(args?: SelectSubset<T, LoteCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Lotes and returns the data saved in the database.
     * @param {LoteCreateManyAndReturnArgs} args - Arguments to create many Lotes.
     * @example
     * // Create many Lotes
     * const lote = await prisma.lote.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Lotes and only return the `id`
     * const loteWithIdOnly = await prisma.lote.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends LoteCreateManyAndReturnArgs>(args?: SelectSubset<T, LoteCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LotePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Lote.
     * @param {LoteDeleteArgs} args - Arguments to delete one Lote.
     * @example
     * // Delete one Lote
     * const Lote = await prisma.lote.delete({
     *   where: {
     *     // ... filter to delete one Lote
     *   }
     * })
     * 
     */
    delete<T extends LoteDeleteArgs>(args: SelectSubset<T, LoteDeleteArgs<ExtArgs>>): Prisma__LoteClient<$Result.GetResult<Prisma.$LotePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Lote.
     * @param {LoteUpdateArgs} args - Arguments to update one Lote.
     * @example
     * // Update one Lote
     * const lote = await prisma.lote.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends LoteUpdateArgs>(args: SelectSubset<T, LoteUpdateArgs<ExtArgs>>): Prisma__LoteClient<$Result.GetResult<Prisma.$LotePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Lotes.
     * @param {LoteDeleteManyArgs} args - Arguments to filter Lotes to delete.
     * @example
     * // Delete a few Lotes
     * const { count } = await prisma.lote.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends LoteDeleteManyArgs>(args?: SelectSubset<T, LoteDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Lotes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LoteUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Lotes
     * const lote = await prisma.lote.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends LoteUpdateManyArgs>(args: SelectSubset<T, LoteUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Lotes and returns the data updated in the database.
     * @param {LoteUpdateManyAndReturnArgs} args - Arguments to update many Lotes.
     * @example
     * // Update many Lotes
     * const lote = await prisma.lote.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Lotes and only return the `id`
     * const loteWithIdOnly = await prisma.lote.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends LoteUpdateManyAndReturnArgs>(args: SelectSubset<T, LoteUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LotePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Lote.
     * @param {LoteUpsertArgs} args - Arguments to update or create a Lote.
     * @example
     * // Update or create a Lote
     * const lote = await prisma.lote.upsert({
     *   create: {
     *     // ... data to create a Lote
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Lote we want to update
     *   }
     * })
     */
    upsert<T extends LoteUpsertArgs>(args: SelectSubset<T, LoteUpsertArgs<ExtArgs>>): Prisma__LoteClient<$Result.GetResult<Prisma.$LotePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Lotes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LoteCountArgs} args - Arguments to filter Lotes to count.
     * @example
     * // Count the number of Lotes
     * const count = await prisma.lote.count({
     *   where: {
     *     // ... the filter for the Lotes we want to count
     *   }
     * })
    **/
    count<T extends LoteCountArgs>(
      args?: Subset<T, LoteCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], LoteCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Lote.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LoteAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends LoteAggregateArgs>(args: Subset<T, LoteAggregateArgs>): Prisma.PrismaPromise<GetLoteAggregateType<T>>

    /**
     * Group by Lote.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LoteGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends LoteGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: LoteGroupByArgs['orderBy'] }
        : { orderBy?: LoteGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, LoteGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetLoteGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Lote model
   */
  readonly fields: LoteFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Lote.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__LoteClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    medicamento<T extends MedicamentoDefaultArgs<ExtArgs> = {}>(args?: Subset<T, MedicamentoDefaultArgs<ExtArgs>>): Prisma__MedicamentoClient<$Result.GetResult<Prisma.$MedicamentoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    dispensacaoItens<T extends Lote$dispensacaoItensArgs<ExtArgs> = {}>(args?: Subset<T, Lote$dispensacaoItensArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DispensacaoItemPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    embalagensFracionadas<T extends Lote$embalagensFracionadasArgs<ExtArgs> = {}>(args?: Subset<T, Lote$embalagensFracionadasArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EmbalageFracionadaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Lote model
   */
  interface LoteFieldRefs {
    readonly id: FieldRef<"Lote", 'String'>
    readonly medicamentoId: FieldRef<"Lote", 'String'>
    readonly numeroLote: FieldRef<"Lote", 'String'>
    readonly quantidade: FieldRef<"Lote", 'Int'>
    readonly quantidadeAtual: FieldRef<"Lote", 'Int'>
    readonly quantidadeCaixasFechadas: FieldRef<"Lote", 'Int'>
    readonly quantidadePorCaixa: FieldRef<"Lote", 'Int'>
    readonly validade: FieldRef<"Lote", 'DateTime'>
    readonly fornecedor: FieldRef<"Lote", 'String'>
    readonly notaFiscal: FieldRef<"Lote", 'String'>
    readonly criadoEm: FieldRef<"Lote", 'DateTime'>
    readonly deletedAt: FieldRef<"Lote", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Lote findUnique
   */
  export type LoteFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lote
     */
    select?: LoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Lote
     */
    omit?: LoteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LoteInclude<ExtArgs> | null
    /**
     * Filter, which Lote to fetch.
     */
    where: LoteWhereUniqueInput
  }

  /**
   * Lote findUniqueOrThrow
   */
  export type LoteFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lote
     */
    select?: LoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Lote
     */
    omit?: LoteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LoteInclude<ExtArgs> | null
    /**
     * Filter, which Lote to fetch.
     */
    where: LoteWhereUniqueInput
  }

  /**
   * Lote findFirst
   */
  export type LoteFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lote
     */
    select?: LoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Lote
     */
    omit?: LoteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LoteInclude<ExtArgs> | null
    /**
     * Filter, which Lote to fetch.
     */
    where?: LoteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Lotes to fetch.
     */
    orderBy?: LoteOrderByWithRelationInput | LoteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Lotes.
     */
    cursor?: LoteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Lotes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Lotes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Lotes.
     */
    distinct?: LoteScalarFieldEnum | LoteScalarFieldEnum[]
  }

  /**
   * Lote findFirstOrThrow
   */
  export type LoteFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lote
     */
    select?: LoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Lote
     */
    omit?: LoteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LoteInclude<ExtArgs> | null
    /**
     * Filter, which Lote to fetch.
     */
    where?: LoteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Lotes to fetch.
     */
    orderBy?: LoteOrderByWithRelationInput | LoteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Lotes.
     */
    cursor?: LoteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Lotes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Lotes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Lotes.
     */
    distinct?: LoteScalarFieldEnum | LoteScalarFieldEnum[]
  }

  /**
   * Lote findMany
   */
  export type LoteFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lote
     */
    select?: LoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Lote
     */
    omit?: LoteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LoteInclude<ExtArgs> | null
    /**
     * Filter, which Lotes to fetch.
     */
    where?: LoteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Lotes to fetch.
     */
    orderBy?: LoteOrderByWithRelationInput | LoteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Lotes.
     */
    cursor?: LoteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Lotes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Lotes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Lotes.
     */
    distinct?: LoteScalarFieldEnum | LoteScalarFieldEnum[]
  }

  /**
   * Lote create
   */
  export type LoteCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lote
     */
    select?: LoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Lote
     */
    omit?: LoteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LoteInclude<ExtArgs> | null
    /**
     * The data needed to create a Lote.
     */
    data: XOR<LoteCreateInput, LoteUncheckedCreateInput>
  }

  /**
   * Lote createMany
   */
  export type LoteCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Lotes.
     */
    data: LoteCreateManyInput | LoteCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Lote createManyAndReturn
   */
  export type LoteCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lote
     */
    select?: LoteSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Lote
     */
    omit?: LoteOmit<ExtArgs> | null
    /**
     * The data used to create many Lotes.
     */
    data: LoteCreateManyInput | LoteCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LoteIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Lote update
   */
  export type LoteUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lote
     */
    select?: LoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Lote
     */
    omit?: LoteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LoteInclude<ExtArgs> | null
    /**
     * The data needed to update a Lote.
     */
    data: XOR<LoteUpdateInput, LoteUncheckedUpdateInput>
    /**
     * Choose, which Lote to update.
     */
    where: LoteWhereUniqueInput
  }

  /**
   * Lote updateMany
   */
  export type LoteUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Lotes.
     */
    data: XOR<LoteUpdateManyMutationInput, LoteUncheckedUpdateManyInput>
    /**
     * Filter which Lotes to update
     */
    where?: LoteWhereInput
    /**
     * Limit how many Lotes to update.
     */
    limit?: number
  }

  /**
   * Lote updateManyAndReturn
   */
  export type LoteUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lote
     */
    select?: LoteSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Lote
     */
    omit?: LoteOmit<ExtArgs> | null
    /**
     * The data used to update Lotes.
     */
    data: XOR<LoteUpdateManyMutationInput, LoteUncheckedUpdateManyInput>
    /**
     * Filter which Lotes to update
     */
    where?: LoteWhereInput
    /**
     * Limit how many Lotes to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LoteIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Lote upsert
   */
  export type LoteUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lote
     */
    select?: LoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Lote
     */
    omit?: LoteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LoteInclude<ExtArgs> | null
    /**
     * The filter to search for the Lote to update in case it exists.
     */
    where: LoteWhereUniqueInput
    /**
     * In case the Lote found by the `where` argument doesn't exist, create a new Lote with this data.
     */
    create: XOR<LoteCreateInput, LoteUncheckedCreateInput>
    /**
     * In case the Lote was found with the provided `where` argument, update it with this data.
     */
    update: XOR<LoteUpdateInput, LoteUncheckedUpdateInput>
  }

  /**
   * Lote delete
   */
  export type LoteDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lote
     */
    select?: LoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Lote
     */
    omit?: LoteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LoteInclude<ExtArgs> | null
    /**
     * Filter which Lote to delete.
     */
    where: LoteWhereUniqueInput
  }

  /**
   * Lote deleteMany
   */
  export type LoteDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Lotes to delete
     */
    where?: LoteWhereInput
    /**
     * Limit how many Lotes to delete.
     */
    limit?: number
  }

  /**
   * Lote.dispensacaoItens
   */
  export type Lote$dispensacaoItensArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DispensacaoItem
     */
    select?: DispensacaoItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DispensacaoItem
     */
    omit?: DispensacaoItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DispensacaoItemInclude<ExtArgs> | null
    where?: DispensacaoItemWhereInput
    orderBy?: DispensacaoItemOrderByWithRelationInput | DispensacaoItemOrderByWithRelationInput[]
    cursor?: DispensacaoItemWhereUniqueInput
    take?: number
    skip?: number
    distinct?: DispensacaoItemScalarFieldEnum | DispensacaoItemScalarFieldEnum[]
  }

  /**
   * Lote.embalagensFracionadas
   */
  export type Lote$embalagensFracionadasArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmbalageFracionada
     */
    select?: EmbalageFracionadaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmbalageFracionada
     */
    omit?: EmbalageFracionadaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmbalageFracionadaInclude<ExtArgs> | null
    where?: EmbalageFracionadaWhereInput
    orderBy?: EmbalageFracionadaOrderByWithRelationInput | EmbalageFracionadaOrderByWithRelationInput[]
    cursor?: EmbalageFracionadaWhereUniqueInput
    take?: number
    skip?: number
    distinct?: EmbalageFracionadaScalarFieldEnum | EmbalageFracionadaScalarFieldEnum[]
  }

  /**
   * Lote without action
   */
  export type LoteDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lote
     */
    select?: LoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Lote
     */
    omit?: LoteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LoteInclude<ExtArgs> | null
  }


  /**
   * Model Paciente
   */

  export type AggregatePaciente = {
    _count: PacienteCountAggregateOutputType | null
    _min: PacienteMinAggregateOutputType | null
    _max: PacienteMaxAggregateOutputType | null
  }

  export type PacienteMinAggregateOutputType = {
    id: string | null
    nome: string | null
    cpf: string | null
    cartaoSus: string | null
    dataNasc: Date | null
    telefone: string | null
    endereco: string | null
    criadoEm: Date | null
    atualizadoEm: Date | null
    deletedAt: Date | null
  }

  export type PacienteMaxAggregateOutputType = {
    id: string | null
    nome: string | null
    cpf: string | null
    cartaoSus: string | null
    dataNasc: Date | null
    telefone: string | null
    endereco: string | null
    criadoEm: Date | null
    atualizadoEm: Date | null
    deletedAt: Date | null
  }

  export type PacienteCountAggregateOutputType = {
    id: number
    nome: number
    cpf: number
    cartaoSus: number
    dataNasc: number
    telefone: number
    endereco: number
    criadoEm: number
    atualizadoEm: number
    deletedAt: number
    _all: number
  }


  export type PacienteMinAggregateInputType = {
    id?: true
    nome?: true
    cpf?: true
    cartaoSus?: true
    dataNasc?: true
    telefone?: true
    endereco?: true
    criadoEm?: true
    atualizadoEm?: true
    deletedAt?: true
  }

  export type PacienteMaxAggregateInputType = {
    id?: true
    nome?: true
    cpf?: true
    cartaoSus?: true
    dataNasc?: true
    telefone?: true
    endereco?: true
    criadoEm?: true
    atualizadoEm?: true
    deletedAt?: true
  }

  export type PacienteCountAggregateInputType = {
    id?: true
    nome?: true
    cpf?: true
    cartaoSus?: true
    dataNasc?: true
    telefone?: true
    endereco?: true
    criadoEm?: true
    atualizadoEm?: true
    deletedAt?: true
    _all?: true
  }

  export type PacienteAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Paciente to aggregate.
     */
    where?: PacienteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Pacientes to fetch.
     */
    orderBy?: PacienteOrderByWithRelationInput | PacienteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PacienteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Pacientes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Pacientes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Pacientes
    **/
    _count?: true | PacienteCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PacienteMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PacienteMaxAggregateInputType
  }

  export type GetPacienteAggregateType<T extends PacienteAggregateArgs> = {
        [P in keyof T & keyof AggregatePaciente]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePaciente[P]>
      : GetScalarType<T[P], AggregatePaciente[P]>
  }




  export type PacienteGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PacienteWhereInput
    orderBy?: PacienteOrderByWithAggregationInput | PacienteOrderByWithAggregationInput[]
    by: PacienteScalarFieldEnum[] | PacienteScalarFieldEnum
    having?: PacienteScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PacienteCountAggregateInputType | true
    _min?: PacienteMinAggregateInputType
    _max?: PacienteMaxAggregateInputType
  }

  export type PacienteGroupByOutputType = {
    id: string
    nome: string
    cpf: string | null
    cartaoSus: string | null
    dataNasc: Date | null
    telefone: string | null
    endereco: string | null
    criadoEm: Date
    atualizadoEm: Date
    deletedAt: Date | null
    _count: PacienteCountAggregateOutputType | null
    _min: PacienteMinAggregateOutputType | null
    _max: PacienteMaxAggregateOutputType | null
  }

  type GetPacienteGroupByPayload<T extends PacienteGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PacienteGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PacienteGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PacienteGroupByOutputType[P]>
            : GetScalarType<T[P], PacienteGroupByOutputType[P]>
        }
      >
    >


  export type PacienteSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nome?: boolean
    cpf?: boolean
    cartaoSus?: boolean
    dataNasc?: boolean
    telefone?: boolean
    endereco?: boolean
    criadoEm?: boolean
    atualizadoEm?: boolean
    deletedAt?: boolean
    prescricoes?: boolean | Paciente$prescricoesArgs<ExtArgs>
    dispensacoes?: boolean | Paciente$dispensacoesArgs<ExtArgs>
    _count?: boolean | PacienteCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["paciente"]>

  export type PacienteSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nome?: boolean
    cpf?: boolean
    cartaoSus?: boolean
    dataNasc?: boolean
    telefone?: boolean
    endereco?: boolean
    criadoEm?: boolean
    atualizadoEm?: boolean
    deletedAt?: boolean
  }, ExtArgs["result"]["paciente"]>

  export type PacienteSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nome?: boolean
    cpf?: boolean
    cartaoSus?: boolean
    dataNasc?: boolean
    telefone?: boolean
    endereco?: boolean
    criadoEm?: boolean
    atualizadoEm?: boolean
    deletedAt?: boolean
  }, ExtArgs["result"]["paciente"]>

  export type PacienteSelectScalar = {
    id?: boolean
    nome?: boolean
    cpf?: boolean
    cartaoSus?: boolean
    dataNasc?: boolean
    telefone?: boolean
    endereco?: boolean
    criadoEm?: boolean
    atualizadoEm?: boolean
    deletedAt?: boolean
  }

  export type PacienteOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "nome" | "cpf" | "cartaoSus" | "dataNasc" | "telefone" | "endereco" | "criadoEm" | "atualizadoEm" | "deletedAt", ExtArgs["result"]["paciente"]>
  export type PacienteInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    prescricoes?: boolean | Paciente$prescricoesArgs<ExtArgs>
    dispensacoes?: boolean | Paciente$dispensacoesArgs<ExtArgs>
    _count?: boolean | PacienteCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type PacienteIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type PacienteIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $PacientePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Paciente"
    objects: {
      prescricoes: Prisma.$PrescricaoPayload<ExtArgs>[]
      dispensacoes: Prisma.$DispensacaoPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      nome: string
      cpf: string | null
      cartaoSus: string | null
      dataNasc: Date | null
      telefone: string | null
      endereco: string | null
      criadoEm: Date
      atualizadoEm: Date
      deletedAt: Date | null
    }, ExtArgs["result"]["paciente"]>
    composites: {}
  }

  type PacienteGetPayload<S extends boolean | null | undefined | PacienteDefaultArgs> = $Result.GetResult<Prisma.$PacientePayload, S>

  type PacienteCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PacienteFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PacienteCountAggregateInputType | true
    }

  export interface PacienteDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Paciente'], meta: { name: 'Paciente' } }
    /**
     * Find zero or one Paciente that matches the filter.
     * @param {PacienteFindUniqueArgs} args - Arguments to find a Paciente
     * @example
     * // Get one Paciente
     * const paciente = await prisma.paciente.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PacienteFindUniqueArgs>(args: SelectSubset<T, PacienteFindUniqueArgs<ExtArgs>>): Prisma__PacienteClient<$Result.GetResult<Prisma.$PacientePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Paciente that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PacienteFindUniqueOrThrowArgs} args - Arguments to find a Paciente
     * @example
     * // Get one Paciente
     * const paciente = await prisma.paciente.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PacienteFindUniqueOrThrowArgs>(args: SelectSubset<T, PacienteFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PacienteClient<$Result.GetResult<Prisma.$PacientePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Paciente that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PacienteFindFirstArgs} args - Arguments to find a Paciente
     * @example
     * // Get one Paciente
     * const paciente = await prisma.paciente.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PacienteFindFirstArgs>(args?: SelectSubset<T, PacienteFindFirstArgs<ExtArgs>>): Prisma__PacienteClient<$Result.GetResult<Prisma.$PacientePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Paciente that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PacienteFindFirstOrThrowArgs} args - Arguments to find a Paciente
     * @example
     * // Get one Paciente
     * const paciente = await prisma.paciente.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PacienteFindFirstOrThrowArgs>(args?: SelectSubset<T, PacienteFindFirstOrThrowArgs<ExtArgs>>): Prisma__PacienteClient<$Result.GetResult<Prisma.$PacientePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Pacientes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PacienteFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Pacientes
     * const pacientes = await prisma.paciente.findMany()
     * 
     * // Get first 10 Pacientes
     * const pacientes = await prisma.paciente.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const pacienteWithIdOnly = await prisma.paciente.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PacienteFindManyArgs>(args?: SelectSubset<T, PacienteFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PacientePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Paciente.
     * @param {PacienteCreateArgs} args - Arguments to create a Paciente.
     * @example
     * // Create one Paciente
     * const Paciente = await prisma.paciente.create({
     *   data: {
     *     // ... data to create a Paciente
     *   }
     * })
     * 
     */
    create<T extends PacienteCreateArgs>(args: SelectSubset<T, PacienteCreateArgs<ExtArgs>>): Prisma__PacienteClient<$Result.GetResult<Prisma.$PacientePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Pacientes.
     * @param {PacienteCreateManyArgs} args - Arguments to create many Pacientes.
     * @example
     * // Create many Pacientes
     * const paciente = await prisma.paciente.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PacienteCreateManyArgs>(args?: SelectSubset<T, PacienteCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Pacientes and returns the data saved in the database.
     * @param {PacienteCreateManyAndReturnArgs} args - Arguments to create many Pacientes.
     * @example
     * // Create many Pacientes
     * const paciente = await prisma.paciente.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Pacientes and only return the `id`
     * const pacienteWithIdOnly = await prisma.paciente.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PacienteCreateManyAndReturnArgs>(args?: SelectSubset<T, PacienteCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PacientePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Paciente.
     * @param {PacienteDeleteArgs} args - Arguments to delete one Paciente.
     * @example
     * // Delete one Paciente
     * const Paciente = await prisma.paciente.delete({
     *   where: {
     *     // ... filter to delete one Paciente
     *   }
     * })
     * 
     */
    delete<T extends PacienteDeleteArgs>(args: SelectSubset<T, PacienteDeleteArgs<ExtArgs>>): Prisma__PacienteClient<$Result.GetResult<Prisma.$PacientePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Paciente.
     * @param {PacienteUpdateArgs} args - Arguments to update one Paciente.
     * @example
     * // Update one Paciente
     * const paciente = await prisma.paciente.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PacienteUpdateArgs>(args: SelectSubset<T, PacienteUpdateArgs<ExtArgs>>): Prisma__PacienteClient<$Result.GetResult<Prisma.$PacientePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Pacientes.
     * @param {PacienteDeleteManyArgs} args - Arguments to filter Pacientes to delete.
     * @example
     * // Delete a few Pacientes
     * const { count } = await prisma.paciente.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PacienteDeleteManyArgs>(args?: SelectSubset<T, PacienteDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Pacientes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PacienteUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Pacientes
     * const paciente = await prisma.paciente.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PacienteUpdateManyArgs>(args: SelectSubset<T, PacienteUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Pacientes and returns the data updated in the database.
     * @param {PacienteUpdateManyAndReturnArgs} args - Arguments to update many Pacientes.
     * @example
     * // Update many Pacientes
     * const paciente = await prisma.paciente.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Pacientes and only return the `id`
     * const pacienteWithIdOnly = await prisma.paciente.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends PacienteUpdateManyAndReturnArgs>(args: SelectSubset<T, PacienteUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PacientePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Paciente.
     * @param {PacienteUpsertArgs} args - Arguments to update or create a Paciente.
     * @example
     * // Update or create a Paciente
     * const paciente = await prisma.paciente.upsert({
     *   create: {
     *     // ... data to create a Paciente
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Paciente we want to update
     *   }
     * })
     */
    upsert<T extends PacienteUpsertArgs>(args: SelectSubset<T, PacienteUpsertArgs<ExtArgs>>): Prisma__PacienteClient<$Result.GetResult<Prisma.$PacientePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Pacientes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PacienteCountArgs} args - Arguments to filter Pacientes to count.
     * @example
     * // Count the number of Pacientes
     * const count = await prisma.paciente.count({
     *   where: {
     *     // ... the filter for the Pacientes we want to count
     *   }
     * })
    **/
    count<T extends PacienteCountArgs>(
      args?: Subset<T, PacienteCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PacienteCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Paciente.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PacienteAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PacienteAggregateArgs>(args: Subset<T, PacienteAggregateArgs>): Prisma.PrismaPromise<GetPacienteAggregateType<T>>

    /**
     * Group by Paciente.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PacienteGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PacienteGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PacienteGroupByArgs['orderBy'] }
        : { orderBy?: PacienteGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PacienteGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPacienteGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Paciente model
   */
  readonly fields: PacienteFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Paciente.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PacienteClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    prescricoes<T extends Paciente$prescricoesArgs<ExtArgs> = {}>(args?: Subset<T, Paciente$prescricoesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PrescricaoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    dispensacoes<T extends Paciente$dispensacoesArgs<ExtArgs> = {}>(args?: Subset<T, Paciente$dispensacoesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DispensacaoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Paciente model
   */
  interface PacienteFieldRefs {
    readonly id: FieldRef<"Paciente", 'String'>
    readonly nome: FieldRef<"Paciente", 'String'>
    readonly cpf: FieldRef<"Paciente", 'String'>
    readonly cartaoSus: FieldRef<"Paciente", 'String'>
    readonly dataNasc: FieldRef<"Paciente", 'DateTime'>
    readonly telefone: FieldRef<"Paciente", 'String'>
    readonly endereco: FieldRef<"Paciente", 'String'>
    readonly criadoEm: FieldRef<"Paciente", 'DateTime'>
    readonly atualizadoEm: FieldRef<"Paciente", 'DateTime'>
    readonly deletedAt: FieldRef<"Paciente", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Paciente findUnique
   */
  export type PacienteFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Paciente
     */
    select?: PacienteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Paciente
     */
    omit?: PacienteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PacienteInclude<ExtArgs> | null
    /**
     * Filter, which Paciente to fetch.
     */
    where: PacienteWhereUniqueInput
  }

  /**
   * Paciente findUniqueOrThrow
   */
  export type PacienteFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Paciente
     */
    select?: PacienteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Paciente
     */
    omit?: PacienteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PacienteInclude<ExtArgs> | null
    /**
     * Filter, which Paciente to fetch.
     */
    where: PacienteWhereUniqueInput
  }

  /**
   * Paciente findFirst
   */
  export type PacienteFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Paciente
     */
    select?: PacienteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Paciente
     */
    omit?: PacienteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PacienteInclude<ExtArgs> | null
    /**
     * Filter, which Paciente to fetch.
     */
    where?: PacienteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Pacientes to fetch.
     */
    orderBy?: PacienteOrderByWithRelationInput | PacienteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Pacientes.
     */
    cursor?: PacienteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Pacientes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Pacientes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Pacientes.
     */
    distinct?: PacienteScalarFieldEnum | PacienteScalarFieldEnum[]
  }

  /**
   * Paciente findFirstOrThrow
   */
  export type PacienteFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Paciente
     */
    select?: PacienteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Paciente
     */
    omit?: PacienteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PacienteInclude<ExtArgs> | null
    /**
     * Filter, which Paciente to fetch.
     */
    where?: PacienteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Pacientes to fetch.
     */
    orderBy?: PacienteOrderByWithRelationInput | PacienteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Pacientes.
     */
    cursor?: PacienteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Pacientes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Pacientes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Pacientes.
     */
    distinct?: PacienteScalarFieldEnum | PacienteScalarFieldEnum[]
  }

  /**
   * Paciente findMany
   */
  export type PacienteFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Paciente
     */
    select?: PacienteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Paciente
     */
    omit?: PacienteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PacienteInclude<ExtArgs> | null
    /**
     * Filter, which Pacientes to fetch.
     */
    where?: PacienteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Pacientes to fetch.
     */
    orderBy?: PacienteOrderByWithRelationInput | PacienteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Pacientes.
     */
    cursor?: PacienteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Pacientes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Pacientes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Pacientes.
     */
    distinct?: PacienteScalarFieldEnum | PacienteScalarFieldEnum[]
  }

  /**
   * Paciente create
   */
  export type PacienteCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Paciente
     */
    select?: PacienteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Paciente
     */
    omit?: PacienteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PacienteInclude<ExtArgs> | null
    /**
     * The data needed to create a Paciente.
     */
    data: XOR<PacienteCreateInput, PacienteUncheckedCreateInput>
  }

  /**
   * Paciente createMany
   */
  export type PacienteCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Pacientes.
     */
    data: PacienteCreateManyInput | PacienteCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Paciente createManyAndReturn
   */
  export type PacienteCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Paciente
     */
    select?: PacienteSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Paciente
     */
    omit?: PacienteOmit<ExtArgs> | null
    /**
     * The data used to create many Pacientes.
     */
    data: PacienteCreateManyInput | PacienteCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Paciente update
   */
  export type PacienteUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Paciente
     */
    select?: PacienteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Paciente
     */
    omit?: PacienteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PacienteInclude<ExtArgs> | null
    /**
     * The data needed to update a Paciente.
     */
    data: XOR<PacienteUpdateInput, PacienteUncheckedUpdateInput>
    /**
     * Choose, which Paciente to update.
     */
    where: PacienteWhereUniqueInput
  }

  /**
   * Paciente updateMany
   */
  export type PacienteUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Pacientes.
     */
    data: XOR<PacienteUpdateManyMutationInput, PacienteUncheckedUpdateManyInput>
    /**
     * Filter which Pacientes to update
     */
    where?: PacienteWhereInput
    /**
     * Limit how many Pacientes to update.
     */
    limit?: number
  }

  /**
   * Paciente updateManyAndReturn
   */
  export type PacienteUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Paciente
     */
    select?: PacienteSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Paciente
     */
    omit?: PacienteOmit<ExtArgs> | null
    /**
     * The data used to update Pacientes.
     */
    data: XOR<PacienteUpdateManyMutationInput, PacienteUncheckedUpdateManyInput>
    /**
     * Filter which Pacientes to update
     */
    where?: PacienteWhereInput
    /**
     * Limit how many Pacientes to update.
     */
    limit?: number
  }

  /**
   * Paciente upsert
   */
  export type PacienteUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Paciente
     */
    select?: PacienteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Paciente
     */
    omit?: PacienteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PacienteInclude<ExtArgs> | null
    /**
     * The filter to search for the Paciente to update in case it exists.
     */
    where: PacienteWhereUniqueInput
    /**
     * In case the Paciente found by the `where` argument doesn't exist, create a new Paciente with this data.
     */
    create: XOR<PacienteCreateInput, PacienteUncheckedCreateInput>
    /**
     * In case the Paciente was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PacienteUpdateInput, PacienteUncheckedUpdateInput>
  }

  /**
   * Paciente delete
   */
  export type PacienteDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Paciente
     */
    select?: PacienteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Paciente
     */
    omit?: PacienteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PacienteInclude<ExtArgs> | null
    /**
     * Filter which Paciente to delete.
     */
    where: PacienteWhereUniqueInput
  }

  /**
   * Paciente deleteMany
   */
  export type PacienteDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Pacientes to delete
     */
    where?: PacienteWhereInput
    /**
     * Limit how many Pacientes to delete.
     */
    limit?: number
  }

  /**
   * Paciente.prescricoes
   */
  export type Paciente$prescricoesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Prescricao
     */
    select?: PrescricaoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Prescricao
     */
    omit?: PrescricaoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PrescricaoInclude<ExtArgs> | null
    where?: PrescricaoWhereInput
    orderBy?: PrescricaoOrderByWithRelationInput | PrescricaoOrderByWithRelationInput[]
    cursor?: PrescricaoWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PrescricaoScalarFieldEnum | PrescricaoScalarFieldEnum[]
  }

  /**
   * Paciente.dispensacoes
   */
  export type Paciente$dispensacoesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Dispensacao
     */
    select?: DispensacaoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Dispensacao
     */
    omit?: DispensacaoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DispensacaoInclude<ExtArgs> | null
    where?: DispensacaoWhereInput
    orderBy?: DispensacaoOrderByWithRelationInput | DispensacaoOrderByWithRelationInput[]
    cursor?: DispensacaoWhereUniqueInput
    take?: number
    skip?: number
    distinct?: DispensacaoScalarFieldEnum | DispensacaoScalarFieldEnum[]
  }

  /**
   * Paciente without action
   */
  export type PacienteDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Paciente
     */
    select?: PacienteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Paciente
     */
    omit?: PacienteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PacienteInclude<ExtArgs> | null
  }


  /**
   * Model Prescricao
   */

  export type AggregatePrescricao = {
    _count: PrescricaoCountAggregateOutputType | null
    _min: PrescricaoMinAggregateOutputType | null
    _max: PrescricaoMaxAggregateOutputType | null
  }

  export type PrescricaoMinAggregateOutputType = {
    id: string | null
    pacienteId: string | null
    medicoNome: string | null
    crm: string | null
    dataEmissao: Date | null
    dataValidade: Date | null
    numeroReceita: string | null
    arquivoUrl: string | null
    observacoes: string | null
    criadoEm: Date | null
    deletedAt: Date | null
  }

  export type PrescricaoMaxAggregateOutputType = {
    id: string | null
    pacienteId: string | null
    medicoNome: string | null
    crm: string | null
    dataEmissao: Date | null
    dataValidade: Date | null
    numeroReceita: string | null
    arquivoUrl: string | null
    observacoes: string | null
    criadoEm: Date | null
    deletedAt: Date | null
  }

  export type PrescricaoCountAggregateOutputType = {
    id: number
    pacienteId: number
    medicoNome: number
    crm: number
    dataEmissao: number
    dataValidade: number
    numeroReceita: number
    arquivoUrl: number
    observacoes: number
    criadoEm: number
    deletedAt: number
    _all: number
  }


  export type PrescricaoMinAggregateInputType = {
    id?: true
    pacienteId?: true
    medicoNome?: true
    crm?: true
    dataEmissao?: true
    dataValidade?: true
    numeroReceita?: true
    arquivoUrl?: true
    observacoes?: true
    criadoEm?: true
    deletedAt?: true
  }

  export type PrescricaoMaxAggregateInputType = {
    id?: true
    pacienteId?: true
    medicoNome?: true
    crm?: true
    dataEmissao?: true
    dataValidade?: true
    numeroReceita?: true
    arquivoUrl?: true
    observacoes?: true
    criadoEm?: true
    deletedAt?: true
  }

  export type PrescricaoCountAggregateInputType = {
    id?: true
    pacienteId?: true
    medicoNome?: true
    crm?: true
    dataEmissao?: true
    dataValidade?: true
    numeroReceita?: true
    arquivoUrl?: true
    observacoes?: true
    criadoEm?: true
    deletedAt?: true
    _all?: true
  }

  export type PrescricaoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Prescricao to aggregate.
     */
    where?: PrescricaoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Prescricaos to fetch.
     */
    orderBy?: PrescricaoOrderByWithRelationInput | PrescricaoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PrescricaoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Prescricaos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Prescricaos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Prescricaos
    **/
    _count?: true | PrescricaoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PrescricaoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PrescricaoMaxAggregateInputType
  }

  export type GetPrescricaoAggregateType<T extends PrescricaoAggregateArgs> = {
        [P in keyof T & keyof AggregatePrescricao]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePrescricao[P]>
      : GetScalarType<T[P], AggregatePrescricao[P]>
  }




  export type PrescricaoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PrescricaoWhereInput
    orderBy?: PrescricaoOrderByWithAggregationInput | PrescricaoOrderByWithAggregationInput[]
    by: PrescricaoScalarFieldEnum[] | PrescricaoScalarFieldEnum
    having?: PrescricaoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PrescricaoCountAggregateInputType | true
    _min?: PrescricaoMinAggregateInputType
    _max?: PrescricaoMaxAggregateInputType
  }

  export type PrescricaoGroupByOutputType = {
    id: string
    pacienteId: string
    medicoNome: string | null
    crm: string | null
    dataEmissao: Date
    dataValidade: Date | null
    numeroReceita: string | null
    arquivoUrl: string | null
    observacoes: string | null
    criadoEm: Date
    deletedAt: Date | null
    _count: PrescricaoCountAggregateOutputType | null
    _min: PrescricaoMinAggregateOutputType | null
    _max: PrescricaoMaxAggregateOutputType | null
  }

  type GetPrescricaoGroupByPayload<T extends PrescricaoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PrescricaoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PrescricaoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PrescricaoGroupByOutputType[P]>
            : GetScalarType<T[P], PrescricaoGroupByOutputType[P]>
        }
      >
    >


  export type PrescricaoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    pacienteId?: boolean
    medicoNome?: boolean
    crm?: boolean
    dataEmissao?: boolean
    dataValidade?: boolean
    numeroReceita?: boolean
    arquivoUrl?: boolean
    observacoes?: boolean
    criadoEm?: boolean
    deletedAt?: boolean
    paciente?: boolean | PacienteDefaultArgs<ExtArgs>
    dispensacoes?: boolean | Prescricao$dispensacoesArgs<ExtArgs>
    _count?: boolean | PrescricaoCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["prescricao"]>

  export type PrescricaoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    pacienteId?: boolean
    medicoNome?: boolean
    crm?: boolean
    dataEmissao?: boolean
    dataValidade?: boolean
    numeroReceita?: boolean
    arquivoUrl?: boolean
    observacoes?: boolean
    criadoEm?: boolean
    deletedAt?: boolean
    paciente?: boolean | PacienteDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["prescricao"]>

  export type PrescricaoSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    pacienteId?: boolean
    medicoNome?: boolean
    crm?: boolean
    dataEmissao?: boolean
    dataValidade?: boolean
    numeroReceita?: boolean
    arquivoUrl?: boolean
    observacoes?: boolean
    criadoEm?: boolean
    deletedAt?: boolean
    paciente?: boolean | PacienteDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["prescricao"]>

  export type PrescricaoSelectScalar = {
    id?: boolean
    pacienteId?: boolean
    medicoNome?: boolean
    crm?: boolean
    dataEmissao?: boolean
    dataValidade?: boolean
    numeroReceita?: boolean
    arquivoUrl?: boolean
    observacoes?: boolean
    criadoEm?: boolean
    deletedAt?: boolean
  }

  export type PrescricaoOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "pacienteId" | "medicoNome" | "crm" | "dataEmissao" | "dataValidade" | "numeroReceita" | "arquivoUrl" | "observacoes" | "criadoEm" | "deletedAt", ExtArgs["result"]["prescricao"]>
  export type PrescricaoInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    paciente?: boolean | PacienteDefaultArgs<ExtArgs>
    dispensacoes?: boolean | Prescricao$dispensacoesArgs<ExtArgs>
    _count?: boolean | PrescricaoCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type PrescricaoIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    paciente?: boolean | PacienteDefaultArgs<ExtArgs>
  }
  export type PrescricaoIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    paciente?: boolean | PacienteDefaultArgs<ExtArgs>
  }

  export type $PrescricaoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Prescricao"
    objects: {
      paciente: Prisma.$PacientePayload<ExtArgs>
      dispensacoes: Prisma.$DispensacaoPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      pacienteId: string
      medicoNome: string | null
      crm: string | null
      dataEmissao: Date
      dataValidade: Date | null
      numeroReceita: string | null
      arquivoUrl: string | null
      observacoes: string | null
      criadoEm: Date
      deletedAt: Date | null
    }, ExtArgs["result"]["prescricao"]>
    composites: {}
  }

  type PrescricaoGetPayload<S extends boolean | null | undefined | PrescricaoDefaultArgs> = $Result.GetResult<Prisma.$PrescricaoPayload, S>

  type PrescricaoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PrescricaoFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PrescricaoCountAggregateInputType | true
    }

  export interface PrescricaoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Prescricao'], meta: { name: 'Prescricao' } }
    /**
     * Find zero or one Prescricao that matches the filter.
     * @param {PrescricaoFindUniqueArgs} args - Arguments to find a Prescricao
     * @example
     * // Get one Prescricao
     * const prescricao = await prisma.prescricao.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PrescricaoFindUniqueArgs>(args: SelectSubset<T, PrescricaoFindUniqueArgs<ExtArgs>>): Prisma__PrescricaoClient<$Result.GetResult<Prisma.$PrescricaoPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Prescricao that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PrescricaoFindUniqueOrThrowArgs} args - Arguments to find a Prescricao
     * @example
     * // Get one Prescricao
     * const prescricao = await prisma.prescricao.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PrescricaoFindUniqueOrThrowArgs>(args: SelectSubset<T, PrescricaoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PrescricaoClient<$Result.GetResult<Prisma.$PrescricaoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Prescricao that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PrescricaoFindFirstArgs} args - Arguments to find a Prescricao
     * @example
     * // Get one Prescricao
     * const prescricao = await prisma.prescricao.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PrescricaoFindFirstArgs>(args?: SelectSubset<T, PrescricaoFindFirstArgs<ExtArgs>>): Prisma__PrescricaoClient<$Result.GetResult<Prisma.$PrescricaoPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Prescricao that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PrescricaoFindFirstOrThrowArgs} args - Arguments to find a Prescricao
     * @example
     * // Get one Prescricao
     * const prescricao = await prisma.prescricao.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PrescricaoFindFirstOrThrowArgs>(args?: SelectSubset<T, PrescricaoFindFirstOrThrowArgs<ExtArgs>>): Prisma__PrescricaoClient<$Result.GetResult<Prisma.$PrescricaoPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Prescricaos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PrescricaoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Prescricaos
     * const prescricaos = await prisma.prescricao.findMany()
     * 
     * // Get first 10 Prescricaos
     * const prescricaos = await prisma.prescricao.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const prescricaoWithIdOnly = await prisma.prescricao.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PrescricaoFindManyArgs>(args?: SelectSubset<T, PrescricaoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PrescricaoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Prescricao.
     * @param {PrescricaoCreateArgs} args - Arguments to create a Prescricao.
     * @example
     * // Create one Prescricao
     * const Prescricao = await prisma.prescricao.create({
     *   data: {
     *     // ... data to create a Prescricao
     *   }
     * })
     * 
     */
    create<T extends PrescricaoCreateArgs>(args: SelectSubset<T, PrescricaoCreateArgs<ExtArgs>>): Prisma__PrescricaoClient<$Result.GetResult<Prisma.$PrescricaoPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Prescricaos.
     * @param {PrescricaoCreateManyArgs} args - Arguments to create many Prescricaos.
     * @example
     * // Create many Prescricaos
     * const prescricao = await prisma.prescricao.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PrescricaoCreateManyArgs>(args?: SelectSubset<T, PrescricaoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Prescricaos and returns the data saved in the database.
     * @param {PrescricaoCreateManyAndReturnArgs} args - Arguments to create many Prescricaos.
     * @example
     * // Create many Prescricaos
     * const prescricao = await prisma.prescricao.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Prescricaos and only return the `id`
     * const prescricaoWithIdOnly = await prisma.prescricao.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PrescricaoCreateManyAndReturnArgs>(args?: SelectSubset<T, PrescricaoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PrescricaoPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Prescricao.
     * @param {PrescricaoDeleteArgs} args - Arguments to delete one Prescricao.
     * @example
     * // Delete one Prescricao
     * const Prescricao = await prisma.prescricao.delete({
     *   where: {
     *     // ... filter to delete one Prescricao
     *   }
     * })
     * 
     */
    delete<T extends PrescricaoDeleteArgs>(args: SelectSubset<T, PrescricaoDeleteArgs<ExtArgs>>): Prisma__PrescricaoClient<$Result.GetResult<Prisma.$PrescricaoPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Prescricao.
     * @param {PrescricaoUpdateArgs} args - Arguments to update one Prescricao.
     * @example
     * // Update one Prescricao
     * const prescricao = await prisma.prescricao.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PrescricaoUpdateArgs>(args: SelectSubset<T, PrescricaoUpdateArgs<ExtArgs>>): Prisma__PrescricaoClient<$Result.GetResult<Prisma.$PrescricaoPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Prescricaos.
     * @param {PrescricaoDeleteManyArgs} args - Arguments to filter Prescricaos to delete.
     * @example
     * // Delete a few Prescricaos
     * const { count } = await prisma.prescricao.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PrescricaoDeleteManyArgs>(args?: SelectSubset<T, PrescricaoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Prescricaos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PrescricaoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Prescricaos
     * const prescricao = await prisma.prescricao.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PrescricaoUpdateManyArgs>(args: SelectSubset<T, PrescricaoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Prescricaos and returns the data updated in the database.
     * @param {PrescricaoUpdateManyAndReturnArgs} args - Arguments to update many Prescricaos.
     * @example
     * // Update many Prescricaos
     * const prescricao = await prisma.prescricao.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Prescricaos and only return the `id`
     * const prescricaoWithIdOnly = await prisma.prescricao.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends PrescricaoUpdateManyAndReturnArgs>(args: SelectSubset<T, PrescricaoUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PrescricaoPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Prescricao.
     * @param {PrescricaoUpsertArgs} args - Arguments to update or create a Prescricao.
     * @example
     * // Update or create a Prescricao
     * const prescricao = await prisma.prescricao.upsert({
     *   create: {
     *     // ... data to create a Prescricao
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Prescricao we want to update
     *   }
     * })
     */
    upsert<T extends PrescricaoUpsertArgs>(args: SelectSubset<T, PrescricaoUpsertArgs<ExtArgs>>): Prisma__PrescricaoClient<$Result.GetResult<Prisma.$PrescricaoPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Prescricaos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PrescricaoCountArgs} args - Arguments to filter Prescricaos to count.
     * @example
     * // Count the number of Prescricaos
     * const count = await prisma.prescricao.count({
     *   where: {
     *     // ... the filter for the Prescricaos we want to count
     *   }
     * })
    **/
    count<T extends PrescricaoCountArgs>(
      args?: Subset<T, PrescricaoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PrescricaoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Prescricao.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PrescricaoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PrescricaoAggregateArgs>(args: Subset<T, PrescricaoAggregateArgs>): Prisma.PrismaPromise<GetPrescricaoAggregateType<T>>

    /**
     * Group by Prescricao.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PrescricaoGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PrescricaoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PrescricaoGroupByArgs['orderBy'] }
        : { orderBy?: PrescricaoGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PrescricaoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPrescricaoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Prescricao model
   */
  readonly fields: PrescricaoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Prescricao.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PrescricaoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    paciente<T extends PacienteDefaultArgs<ExtArgs> = {}>(args?: Subset<T, PacienteDefaultArgs<ExtArgs>>): Prisma__PacienteClient<$Result.GetResult<Prisma.$PacientePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    dispensacoes<T extends Prescricao$dispensacoesArgs<ExtArgs> = {}>(args?: Subset<T, Prescricao$dispensacoesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DispensacaoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Prescricao model
   */
  interface PrescricaoFieldRefs {
    readonly id: FieldRef<"Prescricao", 'String'>
    readonly pacienteId: FieldRef<"Prescricao", 'String'>
    readonly medicoNome: FieldRef<"Prescricao", 'String'>
    readonly crm: FieldRef<"Prescricao", 'String'>
    readonly dataEmissao: FieldRef<"Prescricao", 'DateTime'>
    readonly dataValidade: FieldRef<"Prescricao", 'DateTime'>
    readonly numeroReceita: FieldRef<"Prescricao", 'String'>
    readonly arquivoUrl: FieldRef<"Prescricao", 'String'>
    readonly observacoes: FieldRef<"Prescricao", 'String'>
    readonly criadoEm: FieldRef<"Prescricao", 'DateTime'>
    readonly deletedAt: FieldRef<"Prescricao", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Prescricao findUnique
   */
  export type PrescricaoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Prescricao
     */
    select?: PrescricaoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Prescricao
     */
    omit?: PrescricaoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PrescricaoInclude<ExtArgs> | null
    /**
     * Filter, which Prescricao to fetch.
     */
    where: PrescricaoWhereUniqueInput
  }

  /**
   * Prescricao findUniqueOrThrow
   */
  export type PrescricaoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Prescricao
     */
    select?: PrescricaoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Prescricao
     */
    omit?: PrescricaoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PrescricaoInclude<ExtArgs> | null
    /**
     * Filter, which Prescricao to fetch.
     */
    where: PrescricaoWhereUniqueInput
  }

  /**
   * Prescricao findFirst
   */
  export type PrescricaoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Prescricao
     */
    select?: PrescricaoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Prescricao
     */
    omit?: PrescricaoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PrescricaoInclude<ExtArgs> | null
    /**
     * Filter, which Prescricao to fetch.
     */
    where?: PrescricaoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Prescricaos to fetch.
     */
    orderBy?: PrescricaoOrderByWithRelationInput | PrescricaoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Prescricaos.
     */
    cursor?: PrescricaoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Prescricaos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Prescricaos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Prescricaos.
     */
    distinct?: PrescricaoScalarFieldEnum | PrescricaoScalarFieldEnum[]
  }

  /**
   * Prescricao findFirstOrThrow
   */
  export type PrescricaoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Prescricao
     */
    select?: PrescricaoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Prescricao
     */
    omit?: PrescricaoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PrescricaoInclude<ExtArgs> | null
    /**
     * Filter, which Prescricao to fetch.
     */
    where?: PrescricaoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Prescricaos to fetch.
     */
    orderBy?: PrescricaoOrderByWithRelationInput | PrescricaoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Prescricaos.
     */
    cursor?: PrescricaoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Prescricaos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Prescricaos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Prescricaos.
     */
    distinct?: PrescricaoScalarFieldEnum | PrescricaoScalarFieldEnum[]
  }

  /**
   * Prescricao findMany
   */
  export type PrescricaoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Prescricao
     */
    select?: PrescricaoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Prescricao
     */
    omit?: PrescricaoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PrescricaoInclude<ExtArgs> | null
    /**
     * Filter, which Prescricaos to fetch.
     */
    where?: PrescricaoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Prescricaos to fetch.
     */
    orderBy?: PrescricaoOrderByWithRelationInput | PrescricaoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Prescricaos.
     */
    cursor?: PrescricaoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Prescricaos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Prescricaos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Prescricaos.
     */
    distinct?: PrescricaoScalarFieldEnum | PrescricaoScalarFieldEnum[]
  }

  /**
   * Prescricao create
   */
  export type PrescricaoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Prescricao
     */
    select?: PrescricaoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Prescricao
     */
    omit?: PrescricaoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PrescricaoInclude<ExtArgs> | null
    /**
     * The data needed to create a Prescricao.
     */
    data: XOR<PrescricaoCreateInput, PrescricaoUncheckedCreateInput>
  }

  /**
   * Prescricao createMany
   */
  export type PrescricaoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Prescricaos.
     */
    data: PrescricaoCreateManyInput | PrescricaoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Prescricao createManyAndReturn
   */
  export type PrescricaoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Prescricao
     */
    select?: PrescricaoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Prescricao
     */
    omit?: PrescricaoOmit<ExtArgs> | null
    /**
     * The data used to create many Prescricaos.
     */
    data: PrescricaoCreateManyInput | PrescricaoCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PrescricaoIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Prescricao update
   */
  export type PrescricaoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Prescricao
     */
    select?: PrescricaoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Prescricao
     */
    omit?: PrescricaoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PrescricaoInclude<ExtArgs> | null
    /**
     * The data needed to update a Prescricao.
     */
    data: XOR<PrescricaoUpdateInput, PrescricaoUncheckedUpdateInput>
    /**
     * Choose, which Prescricao to update.
     */
    where: PrescricaoWhereUniqueInput
  }

  /**
   * Prescricao updateMany
   */
  export type PrescricaoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Prescricaos.
     */
    data: XOR<PrescricaoUpdateManyMutationInput, PrescricaoUncheckedUpdateManyInput>
    /**
     * Filter which Prescricaos to update
     */
    where?: PrescricaoWhereInput
    /**
     * Limit how many Prescricaos to update.
     */
    limit?: number
  }

  /**
   * Prescricao updateManyAndReturn
   */
  export type PrescricaoUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Prescricao
     */
    select?: PrescricaoSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Prescricao
     */
    omit?: PrescricaoOmit<ExtArgs> | null
    /**
     * The data used to update Prescricaos.
     */
    data: XOR<PrescricaoUpdateManyMutationInput, PrescricaoUncheckedUpdateManyInput>
    /**
     * Filter which Prescricaos to update
     */
    where?: PrescricaoWhereInput
    /**
     * Limit how many Prescricaos to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PrescricaoIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Prescricao upsert
   */
  export type PrescricaoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Prescricao
     */
    select?: PrescricaoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Prescricao
     */
    omit?: PrescricaoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PrescricaoInclude<ExtArgs> | null
    /**
     * The filter to search for the Prescricao to update in case it exists.
     */
    where: PrescricaoWhereUniqueInput
    /**
     * In case the Prescricao found by the `where` argument doesn't exist, create a new Prescricao with this data.
     */
    create: XOR<PrescricaoCreateInput, PrescricaoUncheckedCreateInput>
    /**
     * In case the Prescricao was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PrescricaoUpdateInput, PrescricaoUncheckedUpdateInput>
  }

  /**
   * Prescricao delete
   */
  export type PrescricaoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Prescricao
     */
    select?: PrescricaoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Prescricao
     */
    omit?: PrescricaoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PrescricaoInclude<ExtArgs> | null
    /**
     * Filter which Prescricao to delete.
     */
    where: PrescricaoWhereUniqueInput
  }

  /**
   * Prescricao deleteMany
   */
  export type PrescricaoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Prescricaos to delete
     */
    where?: PrescricaoWhereInput
    /**
     * Limit how many Prescricaos to delete.
     */
    limit?: number
  }

  /**
   * Prescricao.dispensacoes
   */
  export type Prescricao$dispensacoesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Dispensacao
     */
    select?: DispensacaoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Dispensacao
     */
    omit?: DispensacaoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DispensacaoInclude<ExtArgs> | null
    where?: DispensacaoWhereInput
    orderBy?: DispensacaoOrderByWithRelationInput | DispensacaoOrderByWithRelationInput[]
    cursor?: DispensacaoWhereUniqueInput
    take?: number
    skip?: number
    distinct?: DispensacaoScalarFieldEnum | DispensacaoScalarFieldEnum[]
  }

  /**
   * Prescricao without action
   */
  export type PrescricaoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Prescricao
     */
    select?: PrescricaoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Prescricao
     */
    omit?: PrescricaoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PrescricaoInclude<ExtArgs> | null
  }


  /**
   * Model Dispensacao
   */

  export type AggregateDispensacao = {
    _count: DispensacaoCountAggregateOutputType | null
    _min: DispensacaoMinAggregateOutputType | null
    _max: DispensacaoMaxAggregateOutputType | null
  }

  export type DispensacaoMinAggregateOutputType = {
    id: string | null
    pacienteId: string | null
    prescricaoId: string | null
    usuarioId: string | null
    dataDispensacao: Date | null
    observacoes: string | null
    criadoEm: Date | null
  }

  export type DispensacaoMaxAggregateOutputType = {
    id: string | null
    pacienteId: string | null
    prescricaoId: string | null
    usuarioId: string | null
    dataDispensacao: Date | null
    observacoes: string | null
    criadoEm: Date | null
  }

  export type DispensacaoCountAggregateOutputType = {
    id: number
    pacienteId: number
    prescricaoId: number
    usuarioId: number
    dataDispensacao: number
    observacoes: number
    criadoEm: number
    _all: number
  }


  export type DispensacaoMinAggregateInputType = {
    id?: true
    pacienteId?: true
    prescricaoId?: true
    usuarioId?: true
    dataDispensacao?: true
    observacoes?: true
    criadoEm?: true
  }

  export type DispensacaoMaxAggregateInputType = {
    id?: true
    pacienteId?: true
    prescricaoId?: true
    usuarioId?: true
    dataDispensacao?: true
    observacoes?: true
    criadoEm?: true
  }

  export type DispensacaoCountAggregateInputType = {
    id?: true
    pacienteId?: true
    prescricaoId?: true
    usuarioId?: true
    dataDispensacao?: true
    observacoes?: true
    criadoEm?: true
    _all?: true
  }

  export type DispensacaoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Dispensacao to aggregate.
     */
    where?: DispensacaoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Dispensacaos to fetch.
     */
    orderBy?: DispensacaoOrderByWithRelationInput | DispensacaoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DispensacaoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Dispensacaos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Dispensacaos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Dispensacaos
    **/
    _count?: true | DispensacaoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DispensacaoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DispensacaoMaxAggregateInputType
  }

  export type GetDispensacaoAggregateType<T extends DispensacaoAggregateArgs> = {
        [P in keyof T & keyof AggregateDispensacao]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDispensacao[P]>
      : GetScalarType<T[P], AggregateDispensacao[P]>
  }




  export type DispensacaoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DispensacaoWhereInput
    orderBy?: DispensacaoOrderByWithAggregationInput | DispensacaoOrderByWithAggregationInput[]
    by: DispensacaoScalarFieldEnum[] | DispensacaoScalarFieldEnum
    having?: DispensacaoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DispensacaoCountAggregateInputType | true
    _min?: DispensacaoMinAggregateInputType
    _max?: DispensacaoMaxAggregateInputType
  }

  export type DispensacaoGroupByOutputType = {
    id: string
    pacienteId: string
    prescricaoId: string | null
    usuarioId: string
    dataDispensacao: Date
    observacoes: string | null
    criadoEm: Date
    _count: DispensacaoCountAggregateOutputType | null
    _min: DispensacaoMinAggregateOutputType | null
    _max: DispensacaoMaxAggregateOutputType | null
  }

  type GetDispensacaoGroupByPayload<T extends DispensacaoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DispensacaoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DispensacaoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DispensacaoGroupByOutputType[P]>
            : GetScalarType<T[P], DispensacaoGroupByOutputType[P]>
        }
      >
    >


  export type DispensacaoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    pacienteId?: boolean
    prescricaoId?: boolean
    usuarioId?: boolean
    dataDispensacao?: boolean
    observacoes?: boolean
    criadoEm?: boolean
    paciente?: boolean | PacienteDefaultArgs<ExtArgs>
    prescricao?: boolean | Dispensacao$prescricaoArgs<ExtArgs>
    itens?: boolean | Dispensacao$itensArgs<ExtArgs>
    _count?: boolean | DispensacaoCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["dispensacao"]>

  export type DispensacaoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    pacienteId?: boolean
    prescricaoId?: boolean
    usuarioId?: boolean
    dataDispensacao?: boolean
    observacoes?: boolean
    criadoEm?: boolean
    paciente?: boolean | PacienteDefaultArgs<ExtArgs>
    prescricao?: boolean | Dispensacao$prescricaoArgs<ExtArgs>
  }, ExtArgs["result"]["dispensacao"]>

  export type DispensacaoSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    pacienteId?: boolean
    prescricaoId?: boolean
    usuarioId?: boolean
    dataDispensacao?: boolean
    observacoes?: boolean
    criadoEm?: boolean
    paciente?: boolean | PacienteDefaultArgs<ExtArgs>
    prescricao?: boolean | Dispensacao$prescricaoArgs<ExtArgs>
  }, ExtArgs["result"]["dispensacao"]>

  export type DispensacaoSelectScalar = {
    id?: boolean
    pacienteId?: boolean
    prescricaoId?: boolean
    usuarioId?: boolean
    dataDispensacao?: boolean
    observacoes?: boolean
    criadoEm?: boolean
  }

  export type DispensacaoOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "pacienteId" | "prescricaoId" | "usuarioId" | "dataDispensacao" | "observacoes" | "criadoEm", ExtArgs["result"]["dispensacao"]>
  export type DispensacaoInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    paciente?: boolean | PacienteDefaultArgs<ExtArgs>
    prescricao?: boolean | Dispensacao$prescricaoArgs<ExtArgs>
    itens?: boolean | Dispensacao$itensArgs<ExtArgs>
    _count?: boolean | DispensacaoCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type DispensacaoIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    paciente?: boolean | PacienteDefaultArgs<ExtArgs>
    prescricao?: boolean | Dispensacao$prescricaoArgs<ExtArgs>
  }
  export type DispensacaoIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    paciente?: boolean | PacienteDefaultArgs<ExtArgs>
    prescricao?: boolean | Dispensacao$prescricaoArgs<ExtArgs>
  }

  export type $DispensacaoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Dispensacao"
    objects: {
      paciente: Prisma.$PacientePayload<ExtArgs>
      prescricao: Prisma.$PrescricaoPayload<ExtArgs> | null
      itens: Prisma.$DispensacaoItemPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      pacienteId: string
      prescricaoId: string | null
      usuarioId: string
      dataDispensacao: Date
      observacoes: string | null
      criadoEm: Date
    }, ExtArgs["result"]["dispensacao"]>
    composites: {}
  }

  type DispensacaoGetPayload<S extends boolean | null | undefined | DispensacaoDefaultArgs> = $Result.GetResult<Prisma.$DispensacaoPayload, S>

  type DispensacaoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<DispensacaoFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: DispensacaoCountAggregateInputType | true
    }

  export interface DispensacaoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Dispensacao'], meta: { name: 'Dispensacao' } }
    /**
     * Find zero or one Dispensacao that matches the filter.
     * @param {DispensacaoFindUniqueArgs} args - Arguments to find a Dispensacao
     * @example
     * // Get one Dispensacao
     * const dispensacao = await prisma.dispensacao.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DispensacaoFindUniqueArgs>(args: SelectSubset<T, DispensacaoFindUniqueArgs<ExtArgs>>): Prisma__DispensacaoClient<$Result.GetResult<Prisma.$DispensacaoPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Dispensacao that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DispensacaoFindUniqueOrThrowArgs} args - Arguments to find a Dispensacao
     * @example
     * // Get one Dispensacao
     * const dispensacao = await prisma.dispensacao.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DispensacaoFindUniqueOrThrowArgs>(args: SelectSubset<T, DispensacaoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DispensacaoClient<$Result.GetResult<Prisma.$DispensacaoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Dispensacao that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DispensacaoFindFirstArgs} args - Arguments to find a Dispensacao
     * @example
     * // Get one Dispensacao
     * const dispensacao = await prisma.dispensacao.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DispensacaoFindFirstArgs>(args?: SelectSubset<T, DispensacaoFindFirstArgs<ExtArgs>>): Prisma__DispensacaoClient<$Result.GetResult<Prisma.$DispensacaoPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Dispensacao that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DispensacaoFindFirstOrThrowArgs} args - Arguments to find a Dispensacao
     * @example
     * // Get one Dispensacao
     * const dispensacao = await prisma.dispensacao.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DispensacaoFindFirstOrThrowArgs>(args?: SelectSubset<T, DispensacaoFindFirstOrThrowArgs<ExtArgs>>): Prisma__DispensacaoClient<$Result.GetResult<Prisma.$DispensacaoPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Dispensacaos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DispensacaoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Dispensacaos
     * const dispensacaos = await prisma.dispensacao.findMany()
     * 
     * // Get first 10 Dispensacaos
     * const dispensacaos = await prisma.dispensacao.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const dispensacaoWithIdOnly = await prisma.dispensacao.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DispensacaoFindManyArgs>(args?: SelectSubset<T, DispensacaoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DispensacaoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Dispensacao.
     * @param {DispensacaoCreateArgs} args - Arguments to create a Dispensacao.
     * @example
     * // Create one Dispensacao
     * const Dispensacao = await prisma.dispensacao.create({
     *   data: {
     *     // ... data to create a Dispensacao
     *   }
     * })
     * 
     */
    create<T extends DispensacaoCreateArgs>(args: SelectSubset<T, DispensacaoCreateArgs<ExtArgs>>): Prisma__DispensacaoClient<$Result.GetResult<Prisma.$DispensacaoPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Dispensacaos.
     * @param {DispensacaoCreateManyArgs} args - Arguments to create many Dispensacaos.
     * @example
     * // Create many Dispensacaos
     * const dispensacao = await prisma.dispensacao.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DispensacaoCreateManyArgs>(args?: SelectSubset<T, DispensacaoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Dispensacaos and returns the data saved in the database.
     * @param {DispensacaoCreateManyAndReturnArgs} args - Arguments to create many Dispensacaos.
     * @example
     * // Create many Dispensacaos
     * const dispensacao = await prisma.dispensacao.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Dispensacaos and only return the `id`
     * const dispensacaoWithIdOnly = await prisma.dispensacao.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DispensacaoCreateManyAndReturnArgs>(args?: SelectSubset<T, DispensacaoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DispensacaoPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Dispensacao.
     * @param {DispensacaoDeleteArgs} args - Arguments to delete one Dispensacao.
     * @example
     * // Delete one Dispensacao
     * const Dispensacao = await prisma.dispensacao.delete({
     *   where: {
     *     // ... filter to delete one Dispensacao
     *   }
     * })
     * 
     */
    delete<T extends DispensacaoDeleteArgs>(args: SelectSubset<T, DispensacaoDeleteArgs<ExtArgs>>): Prisma__DispensacaoClient<$Result.GetResult<Prisma.$DispensacaoPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Dispensacao.
     * @param {DispensacaoUpdateArgs} args - Arguments to update one Dispensacao.
     * @example
     * // Update one Dispensacao
     * const dispensacao = await prisma.dispensacao.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DispensacaoUpdateArgs>(args: SelectSubset<T, DispensacaoUpdateArgs<ExtArgs>>): Prisma__DispensacaoClient<$Result.GetResult<Prisma.$DispensacaoPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Dispensacaos.
     * @param {DispensacaoDeleteManyArgs} args - Arguments to filter Dispensacaos to delete.
     * @example
     * // Delete a few Dispensacaos
     * const { count } = await prisma.dispensacao.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DispensacaoDeleteManyArgs>(args?: SelectSubset<T, DispensacaoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Dispensacaos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DispensacaoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Dispensacaos
     * const dispensacao = await prisma.dispensacao.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DispensacaoUpdateManyArgs>(args: SelectSubset<T, DispensacaoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Dispensacaos and returns the data updated in the database.
     * @param {DispensacaoUpdateManyAndReturnArgs} args - Arguments to update many Dispensacaos.
     * @example
     * // Update many Dispensacaos
     * const dispensacao = await prisma.dispensacao.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Dispensacaos and only return the `id`
     * const dispensacaoWithIdOnly = await prisma.dispensacao.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends DispensacaoUpdateManyAndReturnArgs>(args: SelectSubset<T, DispensacaoUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DispensacaoPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Dispensacao.
     * @param {DispensacaoUpsertArgs} args - Arguments to update or create a Dispensacao.
     * @example
     * // Update or create a Dispensacao
     * const dispensacao = await prisma.dispensacao.upsert({
     *   create: {
     *     // ... data to create a Dispensacao
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Dispensacao we want to update
     *   }
     * })
     */
    upsert<T extends DispensacaoUpsertArgs>(args: SelectSubset<T, DispensacaoUpsertArgs<ExtArgs>>): Prisma__DispensacaoClient<$Result.GetResult<Prisma.$DispensacaoPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Dispensacaos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DispensacaoCountArgs} args - Arguments to filter Dispensacaos to count.
     * @example
     * // Count the number of Dispensacaos
     * const count = await prisma.dispensacao.count({
     *   where: {
     *     // ... the filter for the Dispensacaos we want to count
     *   }
     * })
    **/
    count<T extends DispensacaoCountArgs>(
      args?: Subset<T, DispensacaoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DispensacaoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Dispensacao.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DispensacaoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DispensacaoAggregateArgs>(args: Subset<T, DispensacaoAggregateArgs>): Prisma.PrismaPromise<GetDispensacaoAggregateType<T>>

    /**
     * Group by Dispensacao.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DispensacaoGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DispensacaoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DispensacaoGroupByArgs['orderBy'] }
        : { orderBy?: DispensacaoGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DispensacaoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDispensacaoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Dispensacao model
   */
  readonly fields: DispensacaoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Dispensacao.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DispensacaoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    paciente<T extends PacienteDefaultArgs<ExtArgs> = {}>(args?: Subset<T, PacienteDefaultArgs<ExtArgs>>): Prisma__PacienteClient<$Result.GetResult<Prisma.$PacientePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    prescricao<T extends Dispensacao$prescricaoArgs<ExtArgs> = {}>(args?: Subset<T, Dispensacao$prescricaoArgs<ExtArgs>>): Prisma__PrescricaoClient<$Result.GetResult<Prisma.$PrescricaoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    itens<T extends Dispensacao$itensArgs<ExtArgs> = {}>(args?: Subset<T, Dispensacao$itensArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DispensacaoItemPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Dispensacao model
   */
  interface DispensacaoFieldRefs {
    readonly id: FieldRef<"Dispensacao", 'String'>
    readonly pacienteId: FieldRef<"Dispensacao", 'String'>
    readonly prescricaoId: FieldRef<"Dispensacao", 'String'>
    readonly usuarioId: FieldRef<"Dispensacao", 'String'>
    readonly dataDispensacao: FieldRef<"Dispensacao", 'DateTime'>
    readonly observacoes: FieldRef<"Dispensacao", 'String'>
    readonly criadoEm: FieldRef<"Dispensacao", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Dispensacao findUnique
   */
  export type DispensacaoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Dispensacao
     */
    select?: DispensacaoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Dispensacao
     */
    omit?: DispensacaoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DispensacaoInclude<ExtArgs> | null
    /**
     * Filter, which Dispensacao to fetch.
     */
    where: DispensacaoWhereUniqueInput
  }

  /**
   * Dispensacao findUniqueOrThrow
   */
  export type DispensacaoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Dispensacao
     */
    select?: DispensacaoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Dispensacao
     */
    omit?: DispensacaoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DispensacaoInclude<ExtArgs> | null
    /**
     * Filter, which Dispensacao to fetch.
     */
    where: DispensacaoWhereUniqueInput
  }

  /**
   * Dispensacao findFirst
   */
  export type DispensacaoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Dispensacao
     */
    select?: DispensacaoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Dispensacao
     */
    omit?: DispensacaoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DispensacaoInclude<ExtArgs> | null
    /**
     * Filter, which Dispensacao to fetch.
     */
    where?: DispensacaoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Dispensacaos to fetch.
     */
    orderBy?: DispensacaoOrderByWithRelationInput | DispensacaoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Dispensacaos.
     */
    cursor?: DispensacaoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Dispensacaos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Dispensacaos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Dispensacaos.
     */
    distinct?: DispensacaoScalarFieldEnum | DispensacaoScalarFieldEnum[]
  }

  /**
   * Dispensacao findFirstOrThrow
   */
  export type DispensacaoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Dispensacao
     */
    select?: DispensacaoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Dispensacao
     */
    omit?: DispensacaoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DispensacaoInclude<ExtArgs> | null
    /**
     * Filter, which Dispensacao to fetch.
     */
    where?: DispensacaoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Dispensacaos to fetch.
     */
    orderBy?: DispensacaoOrderByWithRelationInput | DispensacaoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Dispensacaos.
     */
    cursor?: DispensacaoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Dispensacaos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Dispensacaos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Dispensacaos.
     */
    distinct?: DispensacaoScalarFieldEnum | DispensacaoScalarFieldEnum[]
  }

  /**
   * Dispensacao findMany
   */
  export type DispensacaoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Dispensacao
     */
    select?: DispensacaoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Dispensacao
     */
    omit?: DispensacaoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DispensacaoInclude<ExtArgs> | null
    /**
     * Filter, which Dispensacaos to fetch.
     */
    where?: DispensacaoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Dispensacaos to fetch.
     */
    orderBy?: DispensacaoOrderByWithRelationInput | DispensacaoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Dispensacaos.
     */
    cursor?: DispensacaoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Dispensacaos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Dispensacaos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Dispensacaos.
     */
    distinct?: DispensacaoScalarFieldEnum | DispensacaoScalarFieldEnum[]
  }

  /**
   * Dispensacao create
   */
  export type DispensacaoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Dispensacao
     */
    select?: DispensacaoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Dispensacao
     */
    omit?: DispensacaoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DispensacaoInclude<ExtArgs> | null
    /**
     * The data needed to create a Dispensacao.
     */
    data: XOR<DispensacaoCreateInput, DispensacaoUncheckedCreateInput>
  }

  /**
   * Dispensacao createMany
   */
  export type DispensacaoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Dispensacaos.
     */
    data: DispensacaoCreateManyInput | DispensacaoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Dispensacao createManyAndReturn
   */
  export type DispensacaoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Dispensacao
     */
    select?: DispensacaoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Dispensacao
     */
    omit?: DispensacaoOmit<ExtArgs> | null
    /**
     * The data used to create many Dispensacaos.
     */
    data: DispensacaoCreateManyInput | DispensacaoCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DispensacaoIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Dispensacao update
   */
  export type DispensacaoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Dispensacao
     */
    select?: DispensacaoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Dispensacao
     */
    omit?: DispensacaoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DispensacaoInclude<ExtArgs> | null
    /**
     * The data needed to update a Dispensacao.
     */
    data: XOR<DispensacaoUpdateInput, DispensacaoUncheckedUpdateInput>
    /**
     * Choose, which Dispensacao to update.
     */
    where: DispensacaoWhereUniqueInput
  }

  /**
   * Dispensacao updateMany
   */
  export type DispensacaoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Dispensacaos.
     */
    data: XOR<DispensacaoUpdateManyMutationInput, DispensacaoUncheckedUpdateManyInput>
    /**
     * Filter which Dispensacaos to update
     */
    where?: DispensacaoWhereInput
    /**
     * Limit how many Dispensacaos to update.
     */
    limit?: number
  }

  /**
   * Dispensacao updateManyAndReturn
   */
  export type DispensacaoUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Dispensacao
     */
    select?: DispensacaoSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Dispensacao
     */
    omit?: DispensacaoOmit<ExtArgs> | null
    /**
     * The data used to update Dispensacaos.
     */
    data: XOR<DispensacaoUpdateManyMutationInput, DispensacaoUncheckedUpdateManyInput>
    /**
     * Filter which Dispensacaos to update
     */
    where?: DispensacaoWhereInput
    /**
     * Limit how many Dispensacaos to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DispensacaoIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Dispensacao upsert
   */
  export type DispensacaoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Dispensacao
     */
    select?: DispensacaoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Dispensacao
     */
    omit?: DispensacaoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DispensacaoInclude<ExtArgs> | null
    /**
     * The filter to search for the Dispensacao to update in case it exists.
     */
    where: DispensacaoWhereUniqueInput
    /**
     * In case the Dispensacao found by the `where` argument doesn't exist, create a new Dispensacao with this data.
     */
    create: XOR<DispensacaoCreateInput, DispensacaoUncheckedCreateInput>
    /**
     * In case the Dispensacao was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DispensacaoUpdateInput, DispensacaoUncheckedUpdateInput>
  }

  /**
   * Dispensacao delete
   */
  export type DispensacaoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Dispensacao
     */
    select?: DispensacaoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Dispensacao
     */
    omit?: DispensacaoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DispensacaoInclude<ExtArgs> | null
    /**
     * Filter which Dispensacao to delete.
     */
    where: DispensacaoWhereUniqueInput
  }

  /**
   * Dispensacao deleteMany
   */
  export type DispensacaoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Dispensacaos to delete
     */
    where?: DispensacaoWhereInput
    /**
     * Limit how many Dispensacaos to delete.
     */
    limit?: number
  }

  /**
   * Dispensacao.prescricao
   */
  export type Dispensacao$prescricaoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Prescricao
     */
    select?: PrescricaoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Prescricao
     */
    omit?: PrescricaoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PrescricaoInclude<ExtArgs> | null
    where?: PrescricaoWhereInput
  }

  /**
   * Dispensacao.itens
   */
  export type Dispensacao$itensArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DispensacaoItem
     */
    select?: DispensacaoItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DispensacaoItem
     */
    omit?: DispensacaoItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DispensacaoItemInclude<ExtArgs> | null
    where?: DispensacaoItemWhereInput
    orderBy?: DispensacaoItemOrderByWithRelationInput | DispensacaoItemOrderByWithRelationInput[]
    cursor?: DispensacaoItemWhereUniqueInput
    take?: number
    skip?: number
    distinct?: DispensacaoItemScalarFieldEnum | DispensacaoItemScalarFieldEnum[]
  }

  /**
   * Dispensacao without action
   */
  export type DispensacaoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Dispensacao
     */
    select?: DispensacaoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Dispensacao
     */
    omit?: DispensacaoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DispensacaoInclude<ExtArgs> | null
  }


  /**
   * Model DispensacaoItem
   */

  export type AggregateDispensacaoItem = {
    _count: DispensacaoItemCountAggregateOutputType | null
    _avg: DispensacaoItemAvgAggregateOutputType | null
    _sum: DispensacaoItemSumAggregateOutputType | null
    _min: DispensacaoItemMinAggregateOutputType | null
    _max: DispensacaoItemMaxAggregateOutputType | null
  }

  export type DispensacaoItemAvgAggregateOutputType = {
    quantidade: number | null
  }

  export type DispensacaoItemSumAggregateOutputType = {
    quantidade: number | null
  }

  export type DispensacaoItemMinAggregateOutputType = {
    id: string | null
    dispensacaoId: string | null
    medicamentoId: string | null
    loteId: string | null
    embalagemFracionadaId: string | null
    quantidade: number | null
    criadoEm: Date | null
  }

  export type DispensacaoItemMaxAggregateOutputType = {
    id: string | null
    dispensacaoId: string | null
    medicamentoId: string | null
    loteId: string | null
    embalagemFracionadaId: string | null
    quantidade: number | null
    criadoEm: Date | null
  }

  export type DispensacaoItemCountAggregateOutputType = {
    id: number
    dispensacaoId: number
    medicamentoId: number
    loteId: number
    embalagemFracionadaId: number
    quantidade: number
    criadoEm: number
    _all: number
  }


  export type DispensacaoItemAvgAggregateInputType = {
    quantidade?: true
  }

  export type DispensacaoItemSumAggregateInputType = {
    quantidade?: true
  }

  export type DispensacaoItemMinAggregateInputType = {
    id?: true
    dispensacaoId?: true
    medicamentoId?: true
    loteId?: true
    embalagemFracionadaId?: true
    quantidade?: true
    criadoEm?: true
  }

  export type DispensacaoItemMaxAggregateInputType = {
    id?: true
    dispensacaoId?: true
    medicamentoId?: true
    loteId?: true
    embalagemFracionadaId?: true
    quantidade?: true
    criadoEm?: true
  }

  export type DispensacaoItemCountAggregateInputType = {
    id?: true
    dispensacaoId?: true
    medicamentoId?: true
    loteId?: true
    embalagemFracionadaId?: true
    quantidade?: true
    criadoEm?: true
    _all?: true
  }

  export type DispensacaoItemAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DispensacaoItem to aggregate.
     */
    where?: DispensacaoItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DispensacaoItems to fetch.
     */
    orderBy?: DispensacaoItemOrderByWithRelationInput | DispensacaoItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DispensacaoItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DispensacaoItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DispensacaoItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned DispensacaoItems
    **/
    _count?: true | DispensacaoItemCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: DispensacaoItemAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: DispensacaoItemSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DispensacaoItemMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DispensacaoItemMaxAggregateInputType
  }

  export type GetDispensacaoItemAggregateType<T extends DispensacaoItemAggregateArgs> = {
        [P in keyof T & keyof AggregateDispensacaoItem]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDispensacaoItem[P]>
      : GetScalarType<T[P], AggregateDispensacaoItem[P]>
  }




  export type DispensacaoItemGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DispensacaoItemWhereInput
    orderBy?: DispensacaoItemOrderByWithAggregationInput | DispensacaoItemOrderByWithAggregationInput[]
    by: DispensacaoItemScalarFieldEnum[] | DispensacaoItemScalarFieldEnum
    having?: DispensacaoItemScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DispensacaoItemCountAggregateInputType | true
    _avg?: DispensacaoItemAvgAggregateInputType
    _sum?: DispensacaoItemSumAggregateInputType
    _min?: DispensacaoItemMinAggregateInputType
    _max?: DispensacaoItemMaxAggregateInputType
  }

  export type DispensacaoItemGroupByOutputType = {
    id: string
    dispensacaoId: string
    medicamentoId: string
    loteId: string | null
    embalagemFracionadaId: string | null
    quantidade: number
    criadoEm: Date
    _count: DispensacaoItemCountAggregateOutputType | null
    _avg: DispensacaoItemAvgAggregateOutputType | null
    _sum: DispensacaoItemSumAggregateOutputType | null
    _min: DispensacaoItemMinAggregateOutputType | null
    _max: DispensacaoItemMaxAggregateOutputType | null
  }

  type GetDispensacaoItemGroupByPayload<T extends DispensacaoItemGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DispensacaoItemGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DispensacaoItemGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DispensacaoItemGroupByOutputType[P]>
            : GetScalarType<T[P], DispensacaoItemGroupByOutputType[P]>
        }
      >
    >


  export type DispensacaoItemSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    dispensacaoId?: boolean
    medicamentoId?: boolean
    loteId?: boolean
    embalagemFracionadaId?: boolean
    quantidade?: boolean
    criadoEm?: boolean
    dispensacao?: boolean | DispensacaoDefaultArgs<ExtArgs>
    medicamento?: boolean | MedicamentoDefaultArgs<ExtArgs>
    lote?: boolean | DispensacaoItem$loteArgs<ExtArgs>
    embalagem?: boolean | DispensacaoItem$embalagemArgs<ExtArgs>
  }, ExtArgs["result"]["dispensacaoItem"]>

  export type DispensacaoItemSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    dispensacaoId?: boolean
    medicamentoId?: boolean
    loteId?: boolean
    embalagemFracionadaId?: boolean
    quantidade?: boolean
    criadoEm?: boolean
    dispensacao?: boolean | DispensacaoDefaultArgs<ExtArgs>
    medicamento?: boolean | MedicamentoDefaultArgs<ExtArgs>
    lote?: boolean | DispensacaoItem$loteArgs<ExtArgs>
    embalagem?: boolean | DispensacaoItem$embalagemArgs<ExtArgs>
  }, ExtArgs["result"]["dispensacaoItem"]>

  export type DispensacaoItemSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    dispensacaoId?: boolean
    medicamentoId?: boolean
    loteId?: boolean
    embalagemFracionadaId?: boolean
    quantidade?: boolean
    criadoEm?: boolean
    dispensacao?: boolean | DispensacaoDefaultArgs<ExtArgs>
    medicamento?: boolean | MedicamentoDefaultArgs<ExtArgs>
    lote?: boolean | DispensacaoItem$loteArgs<ExtArgs>
    embalagem?: boolean | DispensacaoItem$embalagemArgs<ExtArgs>
  }, ExtArgs["result"]["dispensacaoItem"]>

  export type DispensacaoItemSelectScalar = {
    id?: boolean
    dispensacaoId?: boolean
    medicamentoId?: boolean
    loteId?: boolean
    embalagemFracionadaId?: boolean
    quantidade?: boolean
    criadoEm?: boolean
  }

  export type DispensacaoItemOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "dispensacaoId" | "medicamentoId" | "loteId" | "embalagemFracionadaId" | "quantidade" | "criadoEm", ExtArgs["result"]["dispensacaoItem"]>
  export type DispensacaoItemInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    dispensacao?: boolean | DispensacaoDefaultArgs<ExtArgs>
    medicamento?: boolean | MedicamentoDefaultArgs<ExtArgs>
    lote?: boolean | DispensacaoItem$loteArgs<ExtArgs>
    embalagem?: boolean | DispensacaoItem$embalagemArgs<ExtArgs>
  }
  export type DispensacaoItemIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    dispensacao?: boolean | DispensacaoDefaultArgs<ExtArgs>
    medicamento?: boolean | MedicamentoDefaultArgs<ExtArgs>
    lote?: boolean | DispensacaoItem$loteArgs<ExtArgs>
    embalagem?: boolean | DispensacaoItem$embalagemArgs<ExtArgs>
  }
  export type DispensacaoItemIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    dispensacao?: boolean | DispensacaoDefaultArgs<ExtArgs>
    medicamento?: boolean | MedicamentoDefaultArgs<ExtArgs>
    lote?: boolean | DispensacaoItem$loteArgs<ExtArgs>
    embalagem?: boolean | DispensacaoItem$embalagemArgs<ExtArgs>
  }

  export type $DispensacaoItemPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "DispensacaoItem"
    objects: {
      dispensacao: Prisma.$DispensacaoPayload<ExtArgs>
      medicamento: Prisma.$MedicamentoPayload<ExtArgs>
      lote: Prisma.$LotePayload<ExtArgs> | null
      embalagem: Prisma.$EmbalageFracionadaPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      dispensacaoId: string
      medicamentoId: string
      loteId: string | null
      embalagemFracionadaId: string | null
      quantidade: number
      criadoEm: Date
    }, ExtArgs["result"]["dispensacaoItem"]>
    composites: {}
  }

  type DispensacaoItemGetPayload<S extends boolean | null | undefined | DispensacaoItemDefaultArgs> = $Result.GetResult<Prisma.$DispensacaoItemPayload, S>

  type DispensacaoItemCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<DispensacaoItemFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: DispensacaoItemCountAggregateInputType | true
    }

  export interface DispensacaoItemDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['DispensacaoItem'], meta: { name: 'DispensacaoItem' } }
    /**
     * Find zero or one DispensacaoItem that matches the filter.
     * @param {DispensacaoItemFindUniqueArgs} args - Arguments to find a DispensacaoItem
     * @example
     * // Get one DispensacaoItem
     * const dispensacaoItem = await prisma.dispensacaoItem.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DispensacaoItemFindUniqueArgs>(args: SelectSubset<T, DispensacaoItemFindUniqueArgs<ExtArgs>>): Prisma__DispensacaoItemClient<$Result.GetResult<Prisma.$DispensacaoItemPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one DispensacaoItem that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DispensacaoItemFindUniqueOrThrowArgs} args - Arguments to find a DispensacaoItem
     * @example
     * // Get one DispensacaoItem
     * const dispensacaoItem = await prisma.dispensacaoItem.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DispensacaoItemFindUniqueOrThrowArgs>(args: SelectSubset<T, DispensacaoItemFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DispensacaoItemClient<$Result.GetResult<Prisma.$DispensacaoItemPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DispensacaoItem that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DispensacaoItemFindFirstArgs} args - Arguments to find a DispensacaoItem
     * @example
     * // Get one DispensacaoItem
     * const dispensacaoItem = await prisma.dispensacaoItem.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DispensacaoItemFindFirstArgs>(args?: SelectSubset<T, DispensacaoItemFindFirstArgs<ExtArgs>>): Prisma__DispensacaoItemClient<$Result.GetResult<Prisma.$DispensacaoItemPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DispensacaoItem that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DispensacaoItemFindFirstOrThrowArgs} args - Arguments to find a DispensacaoItem
     * @example
     * // Get one DispensacaoItem
     * const dispensacaoItem = await prisma.dispensacaoItem.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DispensacaoItemFindFirstOrThrowArgs>(args?: SelectSubset<T, DispensacaoItemFindFirstOrThrowArgs<ExtArgs>>): Prisma__DispensacaoItemClient<$Result.GetResult<Prisma.$DispensacaoItemPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more DispensacaoItems that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DispensacaoItemFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DispensacaoItems
     * const dispensacaoItems = await prisma.dispensacaoItem.findMany()
     * 
     * // Get first 10 DispensacaoItems
     * const dispensacaoItems = await prisma.dispensacaoItem.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const dispensacaoItemWithIdOnly = await prisma.dispensacaoItem.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DispensacaoItemFindManyArgs>(args?: SelectSubset<T, DispensacaoItemFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DispensacaoItemPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a DispensacaoItem.
     * @param {DispensacaoItemCreateArgs} args - Arguments to create a DispensacaoItem.
     * @example
     * // Create one DispensacaoItem
     * const DispensacaoItem = await prisma.dispensacaoItem.create({
     *   data: {
     *     // ... data to create a DispensacaoItem
     *   }
     * })
     * 
     */
    create<T extends DispensacaoItemCreateArgs>(args: SelectSubset<T, DispensacaoItemCreateArgs<ExtArgs>>): Prisma__DispensacaoItemClient<$Result.GetResult<Prisma.$DispensacaoItemPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many DispensacaoItems.
     * @param {DispensacaoItemCreateManyArgs} args - Arguments to create many DispensacaoItems.
     * @example
     * // Create many DispensacaoItems
     * const dispensacaoItem = await prisma.dispensacaoItem.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DispensacaoItemCreateManyArgs>(args?: SelectSubset<T, DispensacaoItemCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many DispensacaoItems and returns the data saved in the database.
     * @param {DispensacaoItemCreateManyAndReturnArgs} args - Arguments to create many DispensacaoItems.
     * @example
     * // Create many DispensacaoItems
     * const dispensacaoItem = await prisma.dispensacaoItem.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many DispensacaoItems and only return the `id`
     * const dispensacaoItemWithIdOnly = await prisma.dispensacaoItem.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DispensacaoItemCreateManyAndReturnArgs>(args?: SelectSubset<T, DispensacaoItemCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DispensacaoItemPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a DispensacaoItem.
     * @param {DispensacaoItemDeleteArgs} args - Arguments to delete one DispensacaoItem.
     * @example
     * // Delete one DispensacaoItem
     * const DispensacaoItem = await prisma.dispensacaoItem.delete({
     *   where: {
     *     // ... filter to delete one DispensacaoItem
     *   }
     * })
     * 
     */
    delete<T extends DispensacaoItemDeleteArgs>(args: SelectSubset<T, DispensacaoItemDeleteArgs<ExtArgs>>): Prisma__DispensacaoItemClient<$Result.GetResult<Prisma.$DispensacaoItemPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one DispensacaoItem.
     * @param {DispensacaoItemUpdateArgs} args - Arguments to update one DispensacaoItem.
     * @example
     * // Update one DispensacaoItem
     * const dispensacaoItem = await prisma.dispensacaoItem.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DispensacaoItemUpdateArgs>(args: SelectSubset<T, DispensacaoItemUpdateArgs<ExtArgs>>): Prisma__DispensacaoItemClient<$Result.GetResult<Prisma.$DispensacaoItemPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more DispensacaoItems.
     * @param {DispensacaoItemDeleteManyArgs} args - Arguments to filter DispensacaoItems to delete.
     * @example
     * // Delete a few DispensacaoItems
     * const { count } = await prisma.dispensacaoItem.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DispensacaoItemDeleteManyArgs>(args?: SelectSubset<T, DispensacaoItemDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DispensacaoItems.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DispensacaoItemUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DispensacaoItems
     * const dispensacaoItem = await prisma.dispensacaoItem.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DispensacaoItemUpdateManyArgs>(args: SelectSubset<T, DispensacaoItemUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DispensacaoItems and returns the data updated in the database.
     * @param {DispensacaoItemUpdateManyAndReturnArgs} args - Arguments to update many DispensacaoItems.
     * @example
     * // Update many DispensacaoItems
     * const dispensacaoItem = await prisma.dispensacaoItem.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more DispensacaoItems and only return the `id`
     * const dispensacaoItemWithIdOnly = await prisma.dispensacaoItem.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends DispensacaoItemUpdateManyAndReturnArgs>(args: SelectSubset<T, DispensacaoItemUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DispensacaoItemPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one DispensacaoItem.
     * @param {DispensacaoItemUpsertArgs} args - Arguments to update or create a DispensacaoItem.
     * @example
     * // Update or create a DispensacaoItem
     * const dispensacaoItem = await prisma.dispensacaoItem.upsert({
     *   create: {
     *     // ... data to create a DispensacaoItem
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the DispensacaoItem we want to update
     *   }
     * })
     */
    upsert<T extends DispensacaoItemUpsertArgs>(args: SelectSubset<T, DispensacaoItemUpsertArgs<ExtArgs>>): Prisma__DispensacaoItemClient<$Result.GetResult<Prisma.$DispensacaoItemPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of DispensacaoItems.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DispensacaoItemCountArgs} args - Arguments to filter DispensacaoItems to count.
     * @example
     * // Count the number of DispensacaoItems
     * const count = await prisma.dispensacaoItem.count({
     *   where: {
     *     // ... the filter for the DispensacaoItems we want to count
     *   }
     * })
    **/
    count<T extends DispensacaoItemCountArgs>(
      args?: Subset<T, DispensacaoItemCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DispensacaoItemCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a DispensacaoItem.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DispensacaoItemAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DispensacaoItemAggregateArgs>(args: Subset<T, DispensacaoItemAggregateArgs>): Prisma.PrismaPromise<GetDispensacaoItemAggregateType<T>>

    /**
     * Group by DispensacaoItem.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DispensacaoItemGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DispensacaoItemGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DispensacaoItemGroupByArgs['orderBy'] }
        : { orderBy?: DispensacaoItemGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DispensacaoItemGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDispensacaoItemGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the DispensacaoItem model
   */
  readonly fields: DispensacaoItemFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for DispensacaoItem.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DispensacaoItemClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    dispensacao<T extends DispensacaoDefaultArgs<ExtArgs> = {}>(args?: Subset<T, DispensacaoDefaultArgs<ExtArgs>>): Prisma__DispensacaoClient<$Result.GetResult<Prisma.$DispensacaoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    medicamento<T extends MedicamentoDefaultArgs<ExtArgs> = {}>(args?: Subset<T, MedicamentoDefaultArgs<ExtArgs>>): Prisma__MedicamentoClient<$Result.GetResult<Prisma.$MedicamentoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    lote<T extends DispensacaoItem$loteArgs<ExtArgs> = {}>(args?: Subset<T, DispensacaoItem$loteArgs<ExtArgs>>): Prisma__LoteClient<$Result.GetResult<Prisma.$LotePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    embalagem<T extends DispensacaoItem$embalagemArgs<ExtArgs> = {}>(args?: Subset<T, DispensacaoItem$embalagemArgs<ExtArgs>>): Prisma__EmbalageFracionadaClient<$Result.GetResult<Prisma.$EmbalageFracionadaPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the DispensacaoItem model
   */
  interface DispensacaoItemFieldRefs {
    readonly id: FieldRef<"DispensacaoItem", 'String'>
    readonly dispensacaoId: FieldRef<"DispensacaoItem", 'String'>
    readonly medicamentoId: FieldRef<"DispensacaoItem", 'String'>
    readonly loteId: FieldRef<"DispensacaoItem", 'String'>
    readonly embalagemFracionadaId: FieldRef<"DispensacaoItem", 'String'>
    readonly quantidade: FieldRef<"DispensacaoItem", 'Int'>
    readonly criadoEm: FieldRef<"DispensacaoItem", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * DispensacaoItem findUnique
   */
  export type DispensacaoItemFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DispensacaoItem
     */
    select?: DispensacaoItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DispensacaoItem
     */
    omit?: DispensacaoItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DispensacaoItemInclude<ExtArgs> | null
    /**
     * Filter, which DispensacaoItem to fetch.
     */
    where: DispensacaoItemWhereUniqueInput
  }

  /**
   * DispensacaoItem findUniqueOrThrow
   */
  export type DispensacaoItemFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DispensacaoItem
     */
    select?: DispensacaoItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DispensacaoItem
     */
    omit?: DispensacaoItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DispensacaoItemInclude<ExtArgs> | null
    /**
     * Filter, which DispensacaoItem to fetch.
     */
    where: DispensacaoItemWhereUniqueInput
  }

  /**
   * DispensacaoItem findFirst
   */
  export type DispensacaoItemFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DispensacaoItem
     */
    select?: DispensacaoItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DispensacaoItem
     */
    omit?: DispensacaoItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DispensacaoItemInclude<ExtArgs> | null
    /**
     * Filter, which DispensacaoItem to fetch.
     */
    where?: DispensacaoItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DispensacaoItems to fetch.
     */
    orderBy?: DispensacaoItemOrderByWithRelationInput | DispensacaoItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DispensacaoItems.
     */
    cursor?: DispensacaoItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DispensacaoItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DispensacaoItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DispensacaoItems.
     */
    distinct?: DispensacaoItemScalarFieldEnum | DispensacaoItemScalarFieldEnum[]
  }

  /**
   * DispensacaoItem findFirstOrThrow
   */
  export type DispensacaoItemFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DispensacaoItem
     */
    select?: DispensacaoItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DispensacaoItem
     */
    omit?: DispensacaoItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DispensacaoItemInclude<ExtArgs> | null
    /**
     * Filter, which DispensacaoItem to fetch.
     */
    where?: DispensacaoItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DispensacaoItems to fetch.
     */
    orderBy?: DispensacaoItemOrderByWithRelationInput | DispensacaoItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DispensacaoItems.
     */
    cursor?: DispensacaoItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DispensacaoItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DispensacaoItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DispensacaoItems.
     */
    distinct?: DispensacaoItemScalarFieldEnum | DispensacaoItemScalarFieldEnum[]
  }

  /**
   * DispensacaoItem findMany
   */
  export type DispensacaoItemFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DispensacaoItem
     */
    select?: DispensacaoItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DispensacaoItem
     */
    omit?: DispensacaoItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DispensacaoItemInclude<ExtArgs> | null
    /**
     * Filter, which DispensacaoItems to fetch.
     */
    where?: DispensacaoItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DispensacaoItems to fetch.
     */
    orderBy?: DispensacaoItemOrderByWithRelationInput | DispensacaoItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing DispensacaoItems.
     */
    cursor?: DispensacaoItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DispensacaoItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DispensacaoItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DispensacaoItems.
     */
    distinct?: DispensacaoItemScalarFieldEnum | DispensacaoItemScalarFieldEnum[]
  }

  /**
   * DispensacaoItem create
   */
  export type DispensacaoItemCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DispensacaoItem
     */
    select?: DispensacaoItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DispensacaoItem
     */
    omit?: DispensacaoItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DispensacaoItemInclude<ExtArgs> | null
    /**
     * The data needed to create a DispensacaoItem.
     */
    data: XOR<DispensacaoItemCreateInput, DispensacaoItemUncheckedCreateInput>
  }

  /**
   * DispensacaoItem createMany
   */
  export type DispensacaoItemCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many DispensacaoItems.
     */
    data: DispensacaoItemCreateManyInput | DispensacaoItemCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * DispensacaoItem createManyAndReturn
   */
  export type DispensacaoItemCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DispensacaoItem
     */
    select?: DispensacaoItemSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DispensacaoItem
     */
    omit?: DispensacaoItemOmit<ExtArgs> | null
    /**
     * The data used to create many DispensacaoItems.
     */
    data: DispensacaoItemCreateManyInput | DispensacaoItemCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DispensacaoItemIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * DispensacaoItem update
   */
  export type DispensacaoItemUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DispensacaoItem
     */
    select?: DispensacaoItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DispensacaoItem
     */
    omit?: DispensacaoItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DispensacaoItemInclude<ExtArgs> | null
    /**
     * The data needed to update a DispensacaoItem.
     */
    data: XOR<DispensacaoItemUpdateInput, DispensacaoItemUncheckedUpdateInput>
    /**
     * Choose, which DispensacaoItem to update.
     */
    where: DispensacaoItemWhereUniqueInput
  }

  /**
   * DispensacaoItem updateMany
   */
  export type DispensacaoItemUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update DispensacaoItems.
     */
    data: XOR<DispensacaoItemUpdateManyMutationInput, DispensacaoItemUncheckedUpdateManyInput>
    /**
     * Filter which DispensacaoItems to update
     */
    where?: DispensacaoItemWhereInput
    /**
     * Limit how many DispensacaoItems to update.
     */
    limit?: number
  }

  /**
   * DispensacaoItem updateManyAndReturn
   */
  export type DispensacaoItemUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DispensacaoItem
     */
    select?: DispensacaoItemSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DispensacaoItem
     */
    omit?: DispensacaoItemOmit<ExtArgs> | null
    /**
     * The data used to update DispensacaoItems.
     */
    data: XOR<DispensacaoItemUpdateManyMutationInput, DispensacaoItemUncheckedUpdateManyInput>
    /**
     * Filter which DispensacaoItems to update
     */
    where?: DispensacaoItemWhereInput
    /**
     * Limit how many DispensacaoItems to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DispensacaoItemIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * DispensacaoItem upsert
   */
  export type DispensacaoItemUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DispensacaoItem
     */
    select?: DispensacaoItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DispensacaoItem
     */
    omit?: DispensacaoItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DispensacaoItemInclude<ExtArgs> | null
    /**
     * The filter to search for the DispensacaoItem to update in case it exists.
     */
    where: DispensacaoItemWhereUniqueInput
    /**
     * In case the DispensacaoItem found by the `where` argument doesn't exist, create a new DispensacaoItem with this data.
     */
    create: XOR<DispensacaoItemCreateInput, DispensacaoItemUncheckedCreateInput>
    /**
     * In case the DispensacaoItem was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DispensacaoItemUpdateInput, DispensacaoItemUncheckedUpdateInput>
  }

  /**
   * DispensacaoItem delete
   */
  export type DispensacaoItemDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DispensacaoItem
     */
    select?: DispensacaoItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DispensacaoItem
     */
    omit?: DispensacaoItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DispensacaoItemInclude<ExtArgs> | null
    /**
     * Filter which DispensacaoItem to delete.
     */
    where: DispensacaoItemWhereUniqueInput
  }

  /**
   * DispensacaoItem deleteMany
   */
  export type DispensacaoItemDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DispensacaoItems to delete
     */
    where?: DispensacaoItemWhereInput
    /**
     * Limit how many DispensacaoItems to delete.
     */
    limit?: number
  }

  /**
   * DispensacaoItem.lote
   */
  export type DispensacaoItem$loteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lote
     */
    select?: LoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Lote
     */
    omit?: LoteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LoteInclude<ExtArgs> | null
    where?: LoteWhereInput
  }

  /**
   * DispensacaoItem.embalagem
   */
  export type DispensacaoItem$embalagemArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmbalageFracionada
     */
    select?: EmbalageFracionadaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmbalageFracionada
     */
    omit?: EmbalageFracionadaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmbalageFracionadaInclude<ExtArgs> | null
    where?: EmbalageFracionadaWhereInput
  }

  /**
   * DispensacaoItem without action
   */
  export type DispensacaoItemDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DispensacaoItem
     */
    select?: DispensacaoItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DispensacaoItem
     */
    omit?: DispensacaoItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DispensacaoItemInclude<ExtArgs> | null
  }


  /**
   * Model EmbalageFracionada
   */

  export type AggregateEmbalageFracionada = {
    _count: EmbalageFracionadaCountAggregateOutputType | null
    _avg: EmbalageFracionadaAvgAggregateOutputType | null
    _sum: EmbalageFracionadaSumAggregateOutputType | null
    _min: EmbalageFracionadaMinAggregateOutputType | null
    _max: EmbalageFracionadaMaxAggregateOutputType | null
  }

  export type EmbalageFracionadaAvgAggregateOutputType = {
    quantidadeAtual: number | null
  }

  export type EmbalageFracionadaSumAggregateOutputType = {
    quantidadeAtual: number | null
  }

  export type EmbalageFracionadaMinAggregateOutputType = {
    id: string | null
    loteId: string | null
    medicamentoId: string | null
    codigoQr: string | null
    quantidadeAtual: number | null
    status: string | null
    criadoEm: Date | null
    atualizadoEm: Date | null
    criadoPor: string | null
  }

  export type EmbalageFracionadaMaxAggregateOutputType = {
    id: string | null
    loteId: string | null
    medicamentoId: string | null
    codigoQr: string | null
    quantidadeAtual: number | null
    status: string | null
    criadoEm: Date | null
    atualizadoEm: Date | null
    criadoPor: string | null
  }

  export type EmbalageFracionadaCountAggregateOutputType = {
    id: number
    loteId: number
    medicamentoId: number
    codigoQr: number
    quantidadeAtual: number
    status: number
    criadoEm: number
    atualizadoEm: number
    criadoPor: number
    _all: number
  }


  export type EmbalageFracionadaAvgAggregateInputType = {
    quantidadeAtual?: true
  }

  export type EmbalageFracionadaSumAggregateInputType = {
    quantidadeAtual?: true
  }

  export type EmbalageFracionadaMinAggregateInputType = {
    id?: true
    loteId?: true
    medicamentoId?: true
    codigoQr?: true
    quantidadeAtual?: true
    status?: true
    criadoEm?: true
    atualizadoEm?: true
    criadoPor?: true
  }

  export type EmbalageFracionadaMaxAggregateInputType = {
    id?: true
    loteId?: true
    medicamentoId?: true
    codigoQr?: true
    quantidadeAtual?: true
    status?: true
    criadoEm?: true
    atualizadoEm?: true
    criadoPor?: true
  }

  export type EmbalageFracionadaCountAggregateInputType = {
    id?: true
    loteId?: true
    medicamentoId?: true
    codigoQr?: true
    quantidadeAtual?: true
    status?: true
    criadoEm?: true
    atualizadoEm?: true
    criadoPor?: true
    _all?: true
  }

  export type EmbalageFracionadaAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which EmbalageFracionada to aggregate.
     */
    where?: EmbalageFracionadaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of EmbalageFracionadas to fetch.
     */
    orderBy?: EmbalageFracionadaOrderByWithRelationInput | EmbalageFracionadaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: EmbalageFracionadaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` EmbalageFracionadas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` EmbalageFracionadas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned EmbalageFracionadas
    **/
    _count?: true | EmbalageFracionadaCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: EmbalageFracionadaAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: EmbalageFracionadaSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: EmbalageFracionadaMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: EmbalageFracionadaMaxAggregateInputType
  }

  export type GetEmbalageFracionadaAggregateType<T extends EmbalageFracionadaAggregateArgs> = {
        [P in keyof T & keyof AggregateEmbalageFracionada]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateEmbalageFracionada[P]>
      : GetScalarType<T[P], AggregateEmbalageFracionada[P]>
  }




  export type EmbalageFracionadaGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EmbalageFracionadaWhereInput
    orderBy?: EmbalageFracionadaOrderByWithAggregationInput | EmbalageFracionadaOrderByWithAggregationInput[]
    by: EmbalageFracionadaScalarFieldEnum[] | EmbalageFracionadaScalarFieldEnum
    having?: EmbalageFracionadaScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: EmbalageFracionadaCountAggregateInputType | true
    _avg?: EmbalageFracionadaAvgAggregateInputType
    _sum?: EmbalageFracionadaSumAggregateInputType
    _min?: EmbalageFracionadaMinAggregateInputType
    _max?: EmbalageFracionadaMaxAggregateInputType
  }

  export type EmbalageFracionadaGroupByOutputType = {
    id: string
    loteId: string
    medicamentoId: string
    codigoQr: string
    quantidadeAtual: number
    status: string
    criadoEm: Date
    atualizadoEm: Date
    criadoPor: string
    _count: EmbalageFracionadaCountAggregateOutputType | null
    _avg: EmbalageFracionadaAvgAggregateOutputType | null
    _sum: EmbalageFracionadaSumAggregateOutputType | null
    _min: EmbalageFracionadaMinAggregateOutputType | null
    _max: EmbalageFracionadaMaxAggregateOutputType | null
  }

  type GetEmbalageFracionadaGroupByPayload<T extends EmbalageFracionadaGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<EmbalageFracionadaGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof EmbalageFracionadaGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], EmbalageFracionadaGroupByOutputType[P]>
            : GetScalarType<T[P], EmbalageFracionadaGroupByOutputType[P]>
        }
      >
    >


  export type EmbalageFracionadaSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    loteId?: boolean
    medicamentoId?: boolean
    codigoQr?: boolean
    quantidadeAtual?: boolean
    status?: boolean
    criadoEm?: boolean
    atualizadoEm?: boolean
    criadoPor?: boolean
    lote?: boolean | LoteDefaultArgs<ExtArgs>
    medicamento?: boolean | MedicamentoDefaultArgs<ExtArgs>
    dispensacaoItens?: boolean | EmbalageFracionada$dispensacaoItensArgs<ExtArgs>
    movimentacoes?: boolean | EmbalageFracionada$movimentacoesArgs<ExtArgs>
    _count?: boolean | EmbalageFracionadaCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["embalageFracionada"]>

  export type EmbalageFracionadaSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    loteId?: boolean
    medicamentoId?: boolean
    codigoQr?: boolean
    quantidadeAtual?: boolean
    status?: boolean
    criadoEm?: boolean
    atualizadoEm?: boolean
    criadoPor?: boolean
    lote?: boolean | LoteDefaultArgs<ExtArgs>
    medicamento?: boolean | MedicamentoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["embalageFracionada"]>

  export type EmbalageFracionadaSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    loteId?: boolean
    medicamentoId?: boolean
    codigoQr?: boolean
    quantidadeAtual?: boolean
    status?: boolean
    criadoEm?: boolean
    atualizadoEm?: boolean
    criadoPor?: boolean
    lote?: boolean | LoteDefaultArgs<ExtArgs>
    medicamento?: boolean | MedicamentoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["embalageFracionada"]>

  export type EmbalageFracionadaSelectScalar = {
    id?: boolean
    loteId?: boolean
    medicamentoId?: boolean
    codigoQr?: boolean
    quantidadeAtual?: boolean
    status?: boolean
    criadoEm?: boolean
    atualizadoEm?: boolean
    criadoPor?: boolean
  }

  export type EmbalageFracionadaOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "loteId" | "medicamentoId" | "codigoQr" | "quantidadeAtual" | "status" | "criadoEm" | "atualizadoEm" | "criadoPor", ExtArgs["result"]["embalageFracionada"]>
  export type EmbalageFracionadaInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    lote?: boolean | LoteDefaultArgs<ExtArgs>
    medicamento?: boolean | MedicamentoDefaultArgs<ExtArgs>
    dispensacaoItens?: boolean | EmbalageFracionada$dispensacaoItensArgs<ExtArgs>
    movimentacoes?: boolean | EmbalageFracionada$movimentacoesArgs<ExtArgs>
    _count?: boolean | EmbalageFracionadaCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type EmbalageFracionadaIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    lote?: boolean | LoteDefaultArgs<ExtArgs>
    medicamento?: boolean | MedicamentoDefaultArgs<ExtArgs>
  }
  export type EmbalageFracionadaIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    lote?: boolean | LoteDefaultArgs<ExtArgs>
    medicamento?: boolean | MedicamentoDefaultArgs<ExtArgs>
  }

  export type $EmbalageFracionadaPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "EmbalageFracionada"
    objects: {
      lote: Prisma.$LotePayload<ExtArgs>
      medicamento: Prisma.$MedicamentoPayload<ExtArgs>
      dispensacaoItens: Prisma.$DispensacaoItemPayload<ExtArgs>[]
      movimentacoes: Prisma.$MovimentacaoFracionadaPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      loteId: string
      medicamentoId: string
      codigoQr: string
      quantidadeAtual: number
      status: string
      criadoEm: Date
      atualizadoEm: Date
      criadoPor: string
    }, ExtArgs["result"]["embalageFracionada"]>
    composites: {}
  }

  type EmbalageFracionadaGetPayload<S extends boolean | null | undefined | EmbalageFracionadaDefaultArgs> = $Result.GetResult<Prisma.$EmbalageFracionadaPayload, S>

  type EmbalageFracionadaCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<EmbalageFracionadaFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: EmbalageFracionadaCountAggregateInputType | true
    }

  export interface EmbalageFracionadaDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['EmbalageFracionada'], meta: { name: 'EmbalageFracionada' } }
    /**
     * Find zero or one EmbalageFracionada that matches the filter.
     * @param {EmbalageFracionadaFindUniqueArgs} args - Arguments to find a EmbalageFracionada
     * @example
     * // Get one EmbalageFracionada
     * const embalageFracionada = await prisma.embalageFracionada.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends EmbalageFracionadaFindUniqueArgs>(args: SelectSubset<T, EmbalageFracionadaFindUniqueArgs<ExtArgs>>): Prisma__EmbalageFracionadaClient<$Result.GetResult<Prisma.$EmbalageFracionadaPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one EmbalageFracionada that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {EmbalageFracionadaFindUniqueOrThrowArgs} args - Arguments to find a EmbalageFracionada
     * @example
     * // Get one EmbalageFracionada
     * const embalageFracionada = await prisma.embalageFracionada.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends EmbalageFracionadaFindUniqueOrThrowArgs>(args: SelectSubset<T, EmbalageFracionadaFindUniqueOrThrowArgs<ExtArgs>>): Prisma__EmbalageFracionadaClient<$Result.GetResult<Prisma.$EmbalageFracionadaPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first EmbalageFracionada that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmbalageFracionadaFindFirstArgs} args - Arguments to find a EmbalageFracionada
     * @example
     * // Get one EmbalageFracionada
     * const embalageFracionada = await prisma.embalageFracionada.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends EmbalageFracionadaFindFirstArgs>(args?: SelectSubset<T, EmbalageFracionadaFindFirstArgs<ExtArgs>>): Prisma__EmbalageFracionadaClient<$Result.GetResult<Prisma.$EmbalageFracionadaPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first EmbalageFracionada that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmbalageFracionadaFindFirstOrThrowArgs} args - Arguments to find a EmbalageFracionada
     * @example
     * // Get one EmbalageFracionada
     * const embalageFracionada = await prisma.embalageFracionada.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends EmbalageFracionadaFindFirstOrThrowArgs>(args?: SelectSubset<T, EmbalageFracionadaFindFirstOrThrowArgs<ExtArgs>>): Prisma__EmbalageFracionadaClient<$Result.GetResult<Prisma.$EmbalageFracionadaPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more EmbalageFracionadas that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmbalageFracionadaFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all EmbalageFracionadas
     * const embalageFracionadas = await prisma.embalageFracionada.findMany()
     * 
     * // Get first 10 EmbalageFracionadas
     * const embalageFracionadas = await prisma.embalageFracionada.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const embalageFracionadaWithIdOnly = await prisma.embalageFracionada.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends EmbalageFracionadaFindManyArgs>(args?: SelectSubset<T, EmbalageFracionadaFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EmbalageFracionadaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a EmbalageFracionada.
     * @param {EmbalageFracionadaCreateArgs} args - Arguments to create a EmbalageFracionada.
     * @example
     * // Create one EmbalageFracionada
     * const EmbalageFracionada = await prisma.embalageFracionada.create({
     *   data: {
     *     // ... data to create a EmbalageFracionada
     *   }
     * })
     * 
     */
    create<T extends EmbalageFracionadaCreateArgs>(args: SelectSubset<T, EmbalageFracionadaCreateArgs<ExtArgs>>): Prisma__EmbalageFracionadaClient<$Result.GetResult<Prisma.$EmbalageFracionadaPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many EmbalageFracionadas.
     * @param {EmbalageFracionadaCreateManyArgs} args - Arguments to create many EmbalageFracionadas.
     * @example
     * // Create many EmbalageFracionadas
     * const embalageFracionada = await prisma.embalageFracionada.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends EmbalageFracionadaCreateManyArgs>(args?: SelectSubset<T, EmbalageFracionadaCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many EmbalageFracionadas and returns the data saved in the database.
     * @param {EmbalageFracionadaCreateManyAndReturnArgs} args - Arguments to create many EmbalageFracionadas.
     * @example
     * // Create many EmbalageFracionadas
     * const embalageFracionada = await prisma.embalageFracionada.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many EmbalageFracionadas and only return the `id`
     * const embalageFracionadaWithIdOnly = await prisma.embalageFracionada.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends EmbalageFracionadaCreateManyAndReturnArgs>(args?: SelectSubset<T, EmbalageFracionadaCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EmbalageFracionadaPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a EmbalageFracionada.
     * @param {EmbalageFracionadaDeleteArgs} args - Arguments to delete one EmbalageFracionada.
     * @example
     * // Delete one EmbalageFracionada
     * const EmbalageFracionada = await prisma.embalageFracionada.delete({
     *   where: {
     *     // ... filter to delete one EmbalageFracionada
     *   }
     * })
     * 
     */
    delete<T extends EmbalageFracionadaDeleteArgs>(args: SelectSubset<T, EmbalageFracionadaDeleteArgs<ExtArgs>>): Prisma__EmbalageFracionadaClient<$Result.GetResult<Prisma.$EmbalageFracionadaPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one EmbalageFracionada.
     * @param {EmbalageFracionadaUpdateArgs} args - Arguments to update one EmbalageFracionada.
     * @example
     * // Update one EmbalageFracionada
     * const embalageFracionada = await prisma.embalageFracionada.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends EmbalageFracionadaUpdateArgs>(args: SelectSubset<T, EmbalageFracionadaUpdateArgs<ExtArgs>>): Prisma__EmbalageFracionadaClient<$Result.GetResult<Prisma.$EmbalageFracionadaPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more EmbalageFracionadas.
     * @param {EmbalageFracionadaDeleteManyArgs} args - Arguments to filter EmbalageFracionadas to delete.
     * @example
     * // Delete a few EmbalageFracionadas
     * const { count } = await prisma.embalageFracionada.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends EmbalageFracionadaDeleteManyArgs>(args?: SelectSubset<T, EmbalageFracionadaDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more EmbalageFracionadas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmbalageFracionadaUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many EmbalageFracionadas
     * const embalageFracionada = await prisma.embalageFracionada.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends EmbalageFracionadaUpdateManyArgs>(args: SelectSubset<T, EmbalageFracionadaUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more EmbalageFracionadas and returns the data updated in the database.
     * @param {EmbalageFracionadaUpdateManyAndReturnArgs} args - Arguments to update many EmbalageFracionadas.
     * @example
     * // Update many EmbalageFracionadas
     * const embalageFracionada = await prisma.embalageFracionada.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more EmbalageFracionadas and only return the `id`
     * const embalageFracionadaWithIdOnly = await prisma.embalageFracionada.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends EmbalageFracionadaUpdateManyAndReturnArgs>(args: SelectSubset<T, EmbalageFracionadaUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EmbalageFracionadaPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one EmbalageFracionada.
     * @param {EmbalageFracionadaUpsertArgs} args - Arguments to update or create a EmbalageFracionada.
     * @example
     * // Update or create a EmbalageFracionada
     * const embalageFracionada = await prisma.embalageFracionada.upsert({
     *   create: {
     *     // ... data to create a EmbalageFracionada
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the EmbalageFracionada we want to update
     *   }
     * })
     */
    upsert<T extends EmbalageFracionadaUpsertArgs>(args: SelectSubset<T, EmbalageFracionadaUpsertArgs<ExtArgs>>): Prisma__EmbalageFracionadaClient<$Result.GetResult<Prisma.$EmbalageFracionadaPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of EmbalageFracionadas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmbalageFracionadaCountArgs} args - Arguments to filter EmbalageFracionadas to count.
     * @example
     * // Count the number of EmbalageFracionadas
     * const count = await prisma.embalageFracionada.count({
     *   where: {
     *     // ... the filter for the EmbalageFracionadas we want to count
     *   }
     * })
    **/
    count<T extends EmbalageFracionadaCountArgs>(
      args?: Subset<T, EmbalageFracionadaCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], EmbalageFracionadaCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a EmbalageFracionada.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmbalageFracionadaAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends EmbalageFracionadaAggregateArgs>(args: Subset<T, EmbalageFracionadaAggregateArgs>): Prisma.PrismaPromise<GetEmbalageFracionadaAggregateType<T>>

    /**
     * Group by EmbalageFracionada.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmbalageFracionadaGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends EmbalageFracionadaGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: EmbalageFracionadaGroupByArgs['orderBy'] }
        : { orderBy?: EmbalageFracionadaGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, EmbalageFracionadaGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetEmbalageFracionadaGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the EmbalageFracionada model
   */
  readonly fields: EmbalageFracionadaFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for EmbalageFracionada.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__EmbalageFracionadaClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    lote<T extends LoteDefaultArgs<ExtArgs> = {}>(args?: Subset<T, LoteDefaultArgs<ExtArgs>>): Prisma__LoteClient<$Result.GetResult<Prisma.$LotePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    medicamento<T extends MedicamentoDefaultArgs<ExtArgs> = {}>(args?: Subset<T, MedicamentoDefaultArgs<ExtArgs>>): Prisma__MedicamentoClient<$Result.GetResult<Prisma.$MedicamentoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    dispensacaoItens<T extends EmbalageFracionada$dispensacaoItensArgs<ExtArgs> = {}>(args?: Subset<T, EmbalageFracionada$dispensacaoItensArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DispensacaoItemPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    movimentacoes<T extends EmbalageFracionada$movimentacoesArgs<ExtArgs> = {}>(args?: Subset<T, EmbalageFracionada$movimentacoesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MovimentacaoFracionadaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the EmbalageFracionada model
   */
  interface EmbalageFracionadaFieldRefs {
    readonly id: FieldRef<"EmbalageFracionada", 'String'>
    readonly loteId: FieldRef<"EmbalageFracionada", 'String'>
    readonly medicamentoId: FieldRef<"EmbalageFracionada", 'String'>
    readonly codigoQr: FieldRef<"EmbalageFracionada", 'String'>
    readonly quantidadeAtual: FieldRef<"EmbalageFracionada", 'Int'>
    readonly status: FieldRef<"EmbalageFracionada", 'String'>
    readonly criadoEm: FieldRef<"EmbalageFracionada", 'DateTime'>
    readonly atualizadoEm: FieldRef<"EmbalageFracionada", 'DateTime'>
    readonly criadoPor: FieldRef<"EmbalageFracionada", 'String'>
  }
    

  // Custom InputTypes
  /**
   * EmbalageFracionada findUnique
   */
  export type EmbalageFracionadaFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmbalageFracionada
     */
    select?: EmbalageFracionadaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmbalageFracionada
     */
    omit?: EmbalageFracionadaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmbalageFracionadaInclude<ExtArgs> | null
    /**
     * Filter, which EmbalageFracionada to fetch.
     */
    where: EmbalageFracionadaWhereUniqueInput
  }

  /**
   * EmbalageFracionada findUniqueOrThrow
   */
  export type EmbalageFracionadaFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmbalageFracionada
     */
    select?: EmbalageFracionadaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmbalageFracionada
     */
    omit?: EmbalageFracionadaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmbalageFracionadaInclude<ExtArgs> | null
    /**
     * Filter, which EmbalageFracionada to fetch.
     */
    where: EmbalageFracionadaWhereUniqueInput
  }

  /**
   * EmbalageFracionada findFirst
   */
  export type EmbalageFracionadaFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmbalageFracionada
     */
    select?: EmbalageFracionadaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmbalageFracionada
     */
    omit?: EmbalageFracionadaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmbalageFracionadaInclude<ExtArgs> | null
    /**
     * Filter, which EmbalageFracionada to fetch.
     */
    where?: EmbalageFracionadaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of EmbalageFracionadas to fetch.
     */
    orderBy?: EmbalageFracionadaOrderByWithRelationInput | EmbalageFracionadaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for EmbalageFracionadas.
     */
    cursor?: EmbalageFracionadaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` EmbalageFracionadas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` EmbalageFracionadas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of EmbalageFracionadas.
     */
    distinct?: EmbalageFracionadaScalarFieldEnum | EmbalageFracionadaScalarFieldEnum[]
  }

  /**
   * EmbalageFracionada findFirstOrThrow
   */
  export type EmbalageFracionadaFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmbalageFracionada
     */
    select?: EmbalageFracionadaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmbalageFracionada
     */
    omit?: EmbalageFracionadaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmbalageFracionadaInclude<ExtArgs> | null
    /**
     * Filter, which EmbalageFracionada to fetch.
     */
    where?: EmbalageFracionadaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of EmbalageFracionadas to fetch.
     */
    orderBy?: EmbalageFracionadaOrderByWithRelationInput | EmbalageFracionadaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for EmbalageFracionadas.
     */
    cursor?: EmbalageFracionadaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` EmbalageFracionadas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` EmbalageFracionadas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of EmbalageFracionadas.
     */
    distinct?: EmbalageFracionadaScalarFieldEnum | EmbalageFracionadaScalarFieldEnum[]
  }

  /**
   * EmbalageFracionada findMany
   */
  export type EmbalageFracionadaFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmbalageFracionada
     */
    select?: EmbalageFracionadaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmbalageFracionada
     */
    omit?: EmbalageFracionadaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmbalageFracionadaInclude<ExtArgs> | null
    /**
     * Filter, which EmbalageFracionadas to fetch.
     */
    where?: EmbalageFracionadaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of EmbalageFracionadas to fetch.
     */
    orderBy?: EmbalageFracionadaOrderByWithRelationInput | EmbalageFracionadaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing EmbalageFracionadas.
     */
    cursor?: EmbalageFracionadaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` EmbalageFracionadas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` EmbalageFracionadas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of EmbalageFracionadas.
     */
    distinct?: EmbalageFracionadaScalarFieldEnum | EmbalageFracionadaScalarFieldEnum[]
  }

  /**
   * EmbalageFracionada create
   */
  export type EmbalageFracionadaCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmbalageFracionada
     */
    select?: EmbalageFracionadaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmbalageFracionada
     */
    omit?: EmbalageFracionadaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmbalageFracionadaInclude<ExtArgs> | null
    /**
     * The data needed to create a EmbalageFracionada.
     */
    data: XOR<EmbalageFracionadaCreateInput, EmbalageFracionadaUncheckedCreateInput>
  }

  /**
   * EmbalageFracionada createMany
   */
  export type EmbalageFracionadaCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many EmbalageFracionadas.
     */
    data: EmbalageFracionadaCreateManyInput | EmbalageFracionadaCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * EmbalageFracionada createManyAndReturn
   */
  export type EmbalageFracionadaCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmbalageFracionada
     */
    select?: EmbalageFracionadaSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the EmbalageFracionada
     */
    omit?: EmbalageFracionadaOmit<ExtArgs> | null
    /**
     * The data used to create many EmbalageFracionadas.
     */
    data: EmbalageFracionadaCreateManyInput | EmbalageFracionadaCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmbalageFracionadaIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * EmbalageFracionada update
   */
  export type EmbalageFracionadaUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmbalageFracionada
     */
    select?: EmbalageFracionadaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmbalageFracionada
     */
    omit?: EmbalageFracionadaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmbalageFracionadaInclude<ExtArgs> | null
    /**
     * The data needed to update a EmbalageFracionada.
     */
    data: XOR<EmbalageFracionadaUpdateInput, EmbalageFracionadaUncheckedUpdateInput>
    /**
     * Choose, which EmbalageFracionada to update.
     */
    where: EmbalageFracionadaWhereUniqueInput
  }

  /**
   * EmbalageFracionada updateMany
   */
  export type EmbalageFracionadaUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update EmbalageFracionadas.
     */
    data: XOR<EmbalageFracionadaUpdateManyMutationInput, EmbalageFracionadaUncheckedUpdateManyInput>
    /**
     * Filter which EmbalageFracionadas to update
     */
    where?: EmbalageFracionadaWhereInput
    /**
     * Limit how many EmbalageFracionadas to update.
     */
    limit?: number
  }

  /**
   * EmbalageFracionada updateManyAndReturn
   */
  export type EmbalageFracionadaUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmbalageFracionada
     */
    select?: EmbalageFracionadaSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the EmbalageFracionada
     */
    omit?: EmbalageFracionadaOmit<ExtArgs> | null
    /**
     * The data used to update EmbalageFracionadas.
     */
    data: XOR<EmbalageFracionadaUpdateManyMutationInput, EmbalageFracionadaUncheckedUpdateManyInput>
    /**
     * Filter which EmbalageFracionadas to update
     */
    where?: EmbalageFracionadaWhereInput
    /**
     * Limit how many EmbalageFracionadas to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmbalageFracionadaIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * EmbalageFracionada upsert
   */
  export type EmbalageFracionadaUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmbalageFracionada
     */
    select?: EmbalageFracionadaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmbalageFracionada
     */
    omit?: EmbalageFracionadaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmbalageFracionadaInclude<ExtArgs> | null
    /**
     * The filter to search for the EmbalageFracionada to update in case it exists.
     */
    where: EmbalageFracionadaWhereUniqueInput
    /**
     * In case the EmbalageFracionada found by the `where` argument doesn't exist, create a new EmbalageFracionada with this data.
     */
    create: XOR<EmbalageFracionadaCreateInput, EmbalageFracionadaUncheckedCreateInput>
    /**
     * In case the EmbalageFracionada was found with the provided `where` argument, update it with this data.
     */
    update: XOR<EmbalageFracionadaUpdateInput, EmbalageFracionadaUncheckedUpdateInput>
  }

  /**
   * EmbalageFracionada delete
   */
  export type EmbalageFracionadaDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmbalageFracionada
     */
    select?: EmbalageFracionadaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmbalageFracionada
     */
    omit?: EmbalageFracionadaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmbalageFracionadaInclude<ExtArgs> | null
    /**
     * Filter which EmbalageFracionada to delete.
     */
    where: EmbalageFracionadaWhereUniqueInput
  }

  /**
   * EmbalageFracionada deleteMany
   */
  export type EmbalageFracionadaDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which EmbalageFracionadas to delete
     */
    where?: EmbalageFracionadaWhereInput
    /**
     * Limit how many EmbalageFracionadas to delete.
     */
    limit?: number
  }

  /**
   * EmbalageFracionada.dispensacaoItens
   */
  export type EmbalageFracionada$dispensacaoItensArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DispensacaoItem
     */
    select?: DispensacaoItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DispensacaoItem
     */
    omit?: DispensacaoItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DispensacaoItemInclude<ExtArgs> | null
    where?: DispensacaoItemWhereInput
    orderBy?: DispensacaoItemOrderByWithRelationInput | DispensacaoItemOrderByWithRelationInput[]
    cursor?: DispensacaoItemWhereUniqueInput
    take?: number
    skip?: number
    distinct?: DispensacaoItemScalarFieldEnum | DispensacaoItemScalarFieldEnum[]
  }

  /**
   * EmbalageFracionada.movimentacoes
   */
  export type EmbalageFracionada$movimentacoesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MovimentacaoFracionada
     */
    select?: MovimentacaoFracionadaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MovimentacaoFracionada
     */
    omit?: MovimentacaoFracionadaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MovimentacaoFracionadaInclude<ExtArgs> | null
    where?: MovimentacaoFracionadaWhereInput
    orderBy?: MovimentacaoFracionadaOrderByWithRelationInput | MovimentacaoFracionadaOrderByWithRelationInput[]
    cursor?: MovimentacaoFracionadaWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MovimentacaoFracionadaScalarFieldEnum | MovimentacaoFracionadaScalarFieldEnum[]
  }

  /**
   * EmbalageFracionada without action
   */
  export type EmbalageFracionadaDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmbalageFracionada
     */
    select?: EmbalageFracionadaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmbalageFracionada
     */
    omit?: EmbalageFracionadaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmbalageFracionadaInclude<ExtArgs> | null
  }


  /**
   * Model MovimentacaoFracionada
   */

  export type AggregateMovimentacaoFracionada = {
    _count: MovimentacaoFracionadaCountAggregateOutputType | null
    _avg: MovimentacaoFracionadaAvgAggregateOutputType | null
    _sum: MovimentacaoFracionadaSumAggregateOutputType | null
    _min: MovimentacaoFracionadaMinAggregateOutputType | null
    _max: MovimentacaoFracionadaMaxAggregateOutputType | null
  }

  export type MovimentacaoFracionadaAvgAggregateOutputType = {
    quantidadeAnterior: number | null
    quantidadeMovimentada: number | null
    quantidadeResultante: number | null
  }

  export type MovimentacaoFracionadaSumAggregateOutputType = {
    quantidadeAnterior: number | null
    quantidadeMovimentada: number | null
    quantidadeResultante: number | null
  }

  export type MovimentacaoFracionadaMinAggregateOutputType = {
    id: string | null
    embalagemFracionadaId: string | null
    tipo: string | null
    quantidadeAnterior: number | null
    quantidadeMovimentada: number | null
    quantidadeResultante: number | null
    codigoQrAnterior: string | null
    codigoQrNovo: string | null
    usuarioId: string | null
    observacao: string | null
    criadoEm: Date | null
  }

  export type MovimentacaoFracionadaMaxAggregateOutputType = {
    id: string | null
    embalagemFracionadaId: string | null
    tipo: string | null
    quantidadeAnterior: number | null
    quantidadeMovimentada: number | null
    quantidadeResultante: number | null
    codigoQrAnterior: string | null
    codigoQrNovo: string | null
    usuarioId: string | null
    observacao: string | null
    criadoEm: Date | null
  }

  export type MovimentacaoFracionadaCountAggregateOutputType = {
    id: number
    embalagemFracionadaId: number
    tipo: number
    quantidadeAnterior: number
    quantidadeMovimentada: number
    quantidadeResultante: number
    codigoQrAnterior: number
    codigoQrNovo: number
    usuarioId: number
    observacao: number
    criadoEm: number
    _all: number
  }


  export type MovimentacaoFracionadaAvgAggregateInputType = {
    quantidadeAnterior?: true
    quantidadeMovimentada?: true
    quantidadeResultante?: true
  }

  export type MovimentacaoFracionadaSumAggregateInputType = {
    quantidadeAnterior?: true
    quantidadeMovimentada?: true
    quantidadeResultante?: true
  }

  export type MovimentacaoFracionadaMinAggregateInputType = {
    id?: true
    embalagemFracionadaId?: true
    tipo?: true
    quantidadeAnterior?: true
    quantidadeMovimentada?: true
    quantidadeResultante?: true
    codigoQrAnterior?: true
    codigoQrNovo?: true
    usuarioId?: true
    observacao?: true
    criadoEm?: true
  }

  export type MovimentacaoFracionadaMaxAggregateInputType = {
    id?: true
    embalagemFracionadaId?: true
    tipo?: true
    quantidadeAnterior?: true
    quantidadeMovimentada?: true
    quantidadeResultante?: true
    codigoQrAnterior?: true
    codigoQrNovo?: true
    usuarioId?: true
    observacao?: true
    criadoEm?: true
  }

  export type MovimentacaoFracionadaCountAggregateInputType = {
    id?: true
    embalagemFracionadaId?: true
    tipo?: true
    quantidadeAnterior?: true
    quantidadeMovimentada?: true
    quantidadeResultante?: true
    codigoQrAnterior?: true
    codigoQrNovo?: true
    usuarioId?: true
    observacao?: true
    criadoEm?: true
    _all?: true
  }

  export type MovimentacaoFracionadaAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MovimentacaoFracionada to aggregate.
     */
    where?: MovimentacaoFracionadaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MovimentacaoFracionadas to fetch.
     */
    orderBy?: MovimentacaoFracionadaOrderByWithRelationInput | MovimentacaoFracionadaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MovimentacaoFracionadaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MovimentacaoFracionadas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MovimentacaoFracionadas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned MovimentacaoFracionadas
    **/
    _count?: true | MovimentacaoFracionadaCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: MovimentacaoFracionadaAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: MovimentacaoFracionadaSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MovimentacaoFracionadaMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MovimentacaoFracionadaMaxAggregateInputType
  }

  export type GetMovimentacaoFracionadaAggregateType<T extends MovimentacaoFracionadaAggregateArgs> = {
        [P in keyof T & keyof AggregateMovimentacaoFracionada]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMovimentacaoFracionada[P]>
      : GetScalarType<T[P], AggregateMovimentacaoFracionada[P]>
  }




  export type MovimentacaoFracionadaGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MovimentacaoFracionadaWhereInput
    orderBy?: MovimentacaoFracionadaOrderByWithAggregationInput | MovimentacaoFracionadaOrderByWithAggregationInput[]
    by: MovimentacaoFracionadaScalarFieldEnum[] | MovimentacaoFracionadaScalarFieldEnum
    having?: MovimentacaoFracionadaScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MovimentacaoFracionadaCountAggregateInputType | true
    _avg?: MovimentacaoFracionadaAvgAggregateInputType
    _sum?: MovimentacaoFracionadaSumAggregateInputType
    _min?: MovimentacaoFracionadaMinAggregateInputType
    _max?: MovimentacaoFracionadaMaxAggregateInputType
  }

  export type MovimentacaoFracionadaGroupByOutputType = {
    id: string
    embalagemFracionadaId: string
    tipo: string
    quantidadeAnterior: number
    quantidadeMovimentada: number
    quantidadeResultante: number
    codigoQrAnterior: string | null
    codigoQrNovo: string | null
    usuarioId: string
    observacao: string | null
    criadoEm: Date
    _count: MovimentacaoFracionadaCountAggregateOutputType | null
    _avg: MovimentacaoFracionadaAvgAggregateOutputType | null
    _sum: MovimentacaoFracionadaSumAggregateOutputType | null
    _min: MovimentacaoFracionadaMinAggregateOutputType | null
    _max: MovimentacaoFracionadaMaxAggregateOutputType | null
  }

  type GetMovimentacaoFracionadaGroupByPayload<T extends MovimentacaoFracionadaGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MovimentacaoFracionadaGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MovimentacaoFracionadaGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MovimentacaoFracionadaGroupByOutputType[P]>
            : GetScalarType<T[P], MovimentacaoFracionadaGroupByOutputType[P]>
        }
      >
    >


  export type MovimentacaoFracionadaSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    embalagemFracionadaId?: boolean
    tipo?: boolean
    quantidadeAnterior?: boolean
    quantidadeMovimentada?: boolean
    quantidadeResultante?: boolean
    codigoQrAnterior?: boolean
    codigoQrNovo?: boolean
    usuarioId?: boolean
    observacao?: boolean
    criadoEm?: boolean
    embalagem?: boolean | EmbalageFracionadaDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["movimentacaoFracionada"]>

  export type MovimentacaoFracionadaSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    embalagemFracionadaId?: boolean
    tipo?: boolean
    quantidadeAnterior?: boolean
    quantidadeMovimentada?: boolean
    quantidadeResultante?: boolean
    codigoQrAnterior?: boolean
    codigoQrNovo?: boolean
    usuarioId?: boolean
    observacao?: boolean
    criadoEm?: boolean
    embalagem?: boolean | EmbalageFracionadaDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["movimentacaoFracionada"]>

  export type MovimentacaoFracionadaSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    embalagemFracionadaId?: boolean
    tipo?: boolean
    quantidadeAnterior?: boolean
    quantidadeMovimentada?: boolean
    quantidadeResultante?: boolean
    codigoQrAnterior?: boolean
    codigoQrNovo?: boolean
    usuarioId?: boolean
    observacao?: boolean
    criadoEm?: boolean
    embalagem?: boolean | EmbalageFracionadaDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["movimentacaoFracionada"]>

  export type MovimentacaoFracionadaSelectScalar = {
    id?: boolean
    embalagemFracionadaId?: boolean
    tipo?: boolean
    quantidadeAnterior?: boolean
    quantidadeMovimentada?: boolean
    quantidadeResultante?: boolean
    codigoQrAnterior?: boolean
    codigoQrNovo?: boolean
    usuarioId?: boolean
    observacao?: boolean
    criadoEm?: boolean
  }

  export type MovimentacaoFracionadaOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "embalagemFracionadaId" | "tipo" | "quantidadeAnterior" | "quantidadeMovimentada" | "quantidadeResultante" | "codigoQrAnterior" | "codigoQrNovo" | "usuarioId" | "observacao" | "criadoEm", ExtArgs["result"]["movimentacaoFracionada"]>
  export type MovimentacaoFracionadaInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    embalagem?: boolean | EmbalageFracionadaDefaultArgs<ExtArgs>
  }
  export type MovimentacaoFracionadaIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    embalagem?: boolean | EmbalageFracionadaDefaultArgs<ExtArgs>
  }
  export type MovimentacaoFracionadaIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    embalagem?: boolean | EmbalageFracionadaDefaultArgs<ExtArgs>
  }

  export type $MovimentacaoFracionadaPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "MovimentacaoFracionada"
    objects: {
      embalagem: Prisma.$EmbalageFracionadaPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      embalagemFracionadaId: string
      tipo: string
      quantidadeAnterior: number
      quantidadeMovimentada: number
      quantidadeResultante: number
      codigoQrAnterior: string | null
      codigoQrNovo: string | null
      usuarioId: string
      observacao: string | null
      criadoEm: Date
    }, ExtArgs["result"]["movimentacaoFracionada"]>
    composites: {}
  }

  type MovimentacaoFracionadaGetPayload<S extends boolean | null | undefined | MovimentacaoFracionadaDefaultArgs> = $Result.GetResult<Prisma.$MovimentacaoFracionadaPayload, S>

  type MovimentacaoFracionadaCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<MovimentacaoFracionadaFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: MovimentacaoFracionadaCountAggregateInputType | true
    }

  export interface MovimentacaoFracionadaDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['MovimentacaoFracionada'], meta: { name: 'MovimentacaoFracionada' } }
    /**
     * Find zero or one MovimentacaoFracionada that matches the filter.
     * @param {MovimentacaoFracionadaFindUniqueArgs} args - Arguments to find a MovimentacaoFracionada
     * @example
     * // Get one MovimentacaoFracionada
     * const movimentacaoFracionada = await prisma.movimentacaoFracionada.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MovimentacaoFracionadaFindUniqueArgs>(args: SelectSubset<T, MovimentacaoFracionadaFindUniqueArgs<ExtArgs>>): Prisma__MovimentacaoFracionadaClient<$Result.GetResult<Prisma.$MovimentacaoFracionadaPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one MovimentacaoFracionada that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {MovimentacaoFracionadaFindUniqueOrThrowArgs} args - Arguments to find a MovimentacaoFracionada
     * @example
     * // Get one MovimentacaoFracionada
     * const movimentacaoFracionada = await prisma.movimentacaoFracionada.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MovimentacaoFracionadaFindUniqueOrThrowArgs>(args: SelectSubset<T, MovimentacaoFracionadaFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MovimentacaoFracionadaClient<$Result.GetResult<Prisma.$MovimentacaoFracionadaPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first MovimentacaoFracionada that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MovimentacaoFracionadaFindFirstArgs} args - Arguments to find a MovimentacaoFracionada
     * @example
     * // Get one MovimentacaoFracionada
     * const movimentacaoFracionada = await prisma.movimentacaoFracionada.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MovimentacaoFracionadaFindFirstArgs>(args?: SelectSubset<T, MovimentacaoFracionadaFindFirstArgs<ExtArgs>>): Prisma__MovimentacaoFracionadaClient<$Result.GetResult<Prisma.$MovimentacaoFracionadaPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first MovimentacaoFracionada that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MovimentacaoFracionadaFindFirstOrThrowArgs} args - Arguments to find a MovimentacaoFracionada
     * @example
     * // Get one MovimentacaoFracionada
     * const movimentacaoFracionada = await prisma.movimentacaoFracionada.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MovimentacaoFracionadaFindFirstOrThrowArgs>(args?: SelectSubset<T, MovimentacaoFracionadaFindFirstOrThrowArgs<ExtArgs>>): Prisma__MovimentacaoFracionadaClient<$Result.GetResult<Prisma.$MovimentacaoFracionadaPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more MovimentacaoFracionadas that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MovimentacaoFracionadaFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MovimentacaoFracionadas
     * const movimentacaoFracionadas = await prisma.movimentacaoFracionada.findMany()
     * 
     * // Get first 10 MovimentacaoFracionadas
     * const movimentacaoFracionadas = await prisma.movimentacaoFracionada.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const movimentacaoFracionadaWithIdOnly = await prisma.movimentacaoFracionada.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends MovimentacaoFracionadaFindManyArgs>(args?: SelectSubset<T, MovimentacaoFracionadaFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MovimentacaoFracionadaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a MovimentacaoFracionada.
     * @param {MovimentacaoFracionadaCreateArgs} args - Arguments to create a MovimentacaoFracionada.
     * @example
     * // Create one MovimentacaoFracionada
     * const MovimentacaoFracionada = await prisma.movimentacaoFracionada.create({
     *   data: {
     *     // ... data to create a MovimentacaoFracionada
     *   }
     * })
     * 
     */
    create<T extends MovimentacaoFracionadaCreateArgs>(args: SelectSubset<T, MovimentacaoFracionadaCreateArgs<ExtArgs>>): Prisma__MovimentacaoFracionadaClient<$Result.GetResult<Prisma.$MovimentacaoFracionadaPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many MovimentacaoFracionadas.
     * @param {MovimentacaoFracionadaCreateManyArgs} args - Arguments to create many MovimentacaoFracionadas.
     * @example
     * // Create many MovimentacaoFracionadas
     * const movimentacaoFracionada = await prisma.movimentacaoFracionada.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MovimentacaoFracionadaCreateManyArgs>(args?: SelectSubset<T, MovimentacaoFracionadaCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many MovimentacaoFracionadas and returns the data saved in the database.
     * @param {MovimentacaoFracionadaCreateManyAndReturnArgs} args - Arguments to create many MovimentacaoFracionadas.
     * @example
     * // Create many MovimentacaoFracionadas
     * const movimentacaoFracionada = await prisma.movimentacaoFracionada.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many MovimentacaoFracionadas and only return the `id`
     * const movimentacaoFracionadaWithIdOnly = await prisma.movimentacaoFracionada.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends MovimentacaoFracionadaCreateManyAndReturnArgs>(args?: SelectSubset<T, MovimentacaoFracionadaCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MovimentacaoFracionadaPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a MovimentacaoFracionada.
     * @param {MovimentacaoFracionadaDeleteArgs} args - Arguments to delete one MovimentacaoFracionada.
     * @example
     * // Delete one MovimentacaoFracionada
     * const MovimentacaoFracionada = await prisma.movimentacaoFracionada.delete({
     *   where: {
     *     // ... filter to delete one MovimentacaoFracionada
     *   }
     * })
     * 
     */
    delete<T extends MovimentacaoFracionadaDeleteArgs>(args: SelectSubset<T, MovimentacaoFracionadaDeleteArgs<ExtArgs>>): Prisma__MovimentacaoFracionadaClient<$Result.GetResult<Prisma.$MovimentacaoFracionadaPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one MovimentacaoFracionada.
     * @param {MovimentacaoFracionadaUpdateArgs} args - Arguments to update one MovimentacaoFracionada.
     * @example
     * // Update one MovimentacaoFracionada
     * const movimentacaoFracionada = await prisma.movimentacaoFracionada.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MovimentacaoFracionadaUpdateArgs>(args: SelectSubset<T, MovimentacaoFracionadaUpdateArgs<ExtArgs>>): Prisma__MovimentacaoFracionadaClient<$Result.GetResult<Prisma.$MovimentacaoFracionadaPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more MovimentacaoFracionadas.
     * @param {MovimentacaoFracionadaDeleteManyArgs} args - Arguments to filter MovimentacaoFracionadas to delete.
     * @example
     * // Delete a few MovimentacaoFracionadas
     * const { count } = await prisma.movimentacaoFracionada.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MovimentacaoFracionadaDeleteManyArgs>(args?: SelectSubset<T, MovimentacaoFracionadaDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MovimentacaoFracionadas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MovimentacaoFracionadaUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MovimentacaoFracionadas
     * const movimentacaoFracionada = await prisma.movimentacaoFracionada.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MovimentacaoFracionadaUpdateManyArgs>(args: SelectSubset<T, MovimentacaoFracionadaUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MovimentacaoFracionadas and returns the data updated in the database.
     * @param {MovimentacaoFracionadaUpdateManyAndReturnArgs} args - Arguments to update many MovimentacaoFracionadas.
     * @example
     * // Update many MovimentacaoFracionadas
     * const movimentacaoFracionada = await prisma.movimentacaoFracionada.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more MovimentacaoFracionadas and only return the `id`
     * const movimentacaoFracionadaWithIdOnly = await prisma.movimentacaoFracionada.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends MovimentacaoFracionadaUpdateManyAndReturnArgs>(args: SelectSubset<T, MovimentacaoFracionadaUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MovimentacaoFracionadaPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one MovimentacaoFracionada.
     * @param {MovimentacaoFracionadaUpsertArgs} args - Arguments to update or create a MovimentacaoFracionada.
     * @example
     * // Update or create a MovimentacaoFracionada
     * const movimentacaoFracionada = await prisma.movimentacaoFracionada.upsert({
     *   create: {
     *     // ... data to create a MovimentacaoFracionada
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MovimentacaoFracionada we want to update
     *   }
     * })
     */
    upsert<T extends MovimentacaoFracionadaUpsertArgs>(args: SelectSubset<T, MovimentacaoFracionadaUpsertArgs<ExtArgs>>): Prisma__MovimentacaoFracionadaClient<$Result.GetResult<Prisma.$MovimentacaoFracionadaPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of MovimentacaoFracionadas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MovimentacaoFracionadaCountArgs} args - Arguments to filter MovimentacaoFracionadas to count.
     * @example
     * // Count the number of MovimentacaoFracionadas
     * const count = await prisma.movimentacaoFracionada.count({
     *   where: {
     *     // ... the filter for the MovimentacaoFracionadas we want to count
     *   }
     * })
    **/
    count<T extends MovimentacaoFracionadaCountArgs>(
      args?: Subset<T, MovimentacaoFracionadaCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MovimentacaoFracionadaCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a MovimentacaoFracionada.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MovimentacaoFracionadaAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MovimentacaoFracionadaAggregateArgs>(args: Subset<T, MovimentacaoFracionadaAggregateArgs>): Prisma.PrismaPromise<GetMovimentacaoFracionadaAggregateType<T>>

    /**
     * Group by MovimentacaoFracionada.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MovimentacaoFracionadaGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends MovimentacaoFracionadaGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MovimentacaoFracionadaGroupByArgs['orderBy'] }
        : { orderBy?: MovimentacaoFracionadaGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, MovimentacaoFracionadaGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMovimentacaoFracionadaGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the MovimentacaoFracionada model
   */
  readonly fields: MovimentacaoFracionadaFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for MovimentacaoFracionada.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MovimentacaoFracionadaClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    embalagem<T extends EmbalageFracionadaDefaultArgs<ExtArgs> = {}>(args?: Subset<T, EmbalageFracionadaDefaultArgs<ExtArgs>>): Prisma__EmbalageFracionadaClient<$Result.GetResult<Prisma.$EmbalageFracionadaPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the MovimentacaoFracionada model
   */
  interface MovimentacaoFracionadaFieldRefs {
    readonly id: FieldRef<"MovimentacaoFracionada", 'String'>
    readonly embalagemFracionadaId: FieldRef<"MovimentacaoFracionada", 'String'>
    readonly tipo: FieldRef<"MovimentacaoFracionada", 'String'>
    readonly quantidadeAnterior: FieldRef<"MovimentacaoFracionada", 'Int'>
    readonly quantidadeMovimentada: FieldRef<"MovimentacaoFracionada", 'Int'>
    readonly quantidadeResultante: FieldRef<"MovimentacaoFracionada", 'Int'>
    readonly codigoQrAnterior: FieldRef<"MovimentacaoFracionada", 'String'>
    readonly codigoQrNovo: FieldRef<"MovimentacaoFracionada", 'String'>
    readonly usuarioId: FieldRef<"MovimentacaoFracionada", 'String'>
    readonly observacao: FieldRef<"MovimentacaoFracionada", 'String'>
    readonly criadoEm: FieldRef<"MovimentacaoFracionada", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * MovimentacaoFracionada findUnique
   */
  export type MovimentacaoFracionadaFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MovimentacaoFracionada
     */
    select?: MovimentacaoFracionadaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MovimentacaoFracionada
     */
    omit?: MovimentacaoFracionadaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MovimentacaoFracionadaInclude<ExtArgs> | null
    /**
     * Filter, which MovimentacaoFracionada to fetch.
     */
    where: MovimentacaoFracionadaWhereUniqueInput
  }

  /**
   * MovimentacaoFracionada findUniqueOrThrow
   */
  export type MovimentacaoFracionadaFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MovimentacaoFracionada
     */
    select?: MovimentacaoFracionadaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MovimentacaoFracionada
     */
    omit?: MovimentacaoFracionadaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MovimentacaoFracionadaInclude<ExtArgs> | null
    /**
     * Filter, which MovimentacaoFracionada to fetch.
     */
    where: MovimentacaoFracionadaWhereUniqueInput
  }

  /**
   * MovimentacaoFracionada findFirst
   */
  export type MovimentacaoFracionadaFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MovimentacaoFracionada
     */
    select?: MovimentacaoFracionadaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MovimentacaoFracionada
     */
    omit?: MovimentacaoFracionadaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MovimentacaoFracionadaInclude<ExtArgs> | null
    /**
     * Filter, which MovimentacaoFracionada to fetch.
     */
    where?: MovimentacaoFracionadaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MovimentacaoFracionadas to fetch.
     */
    orderBy?: MovimentacaoFracionadaOrderByWithRelationInput | MovimentacaoFracionadaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MovimentacaoFracionadas.
     */
    cursor?: MovimentacaoFracionadaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MovimentacaoFracionadas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MovimentacaoFracionadas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MovimentacaoFracionadas.
     */
    distinct?: MovimentacaoFracionadaScalarFieldEnum | MovimentacaoFracionadaScalarFieldEnum[]
  }

  /**
   * MovimentacaoFracionada findFirstOrThrow
   */
  export type MovimentacaoFracionadaFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MovimentacaoFracionada
     */
    select?: MovimentacaoFracionadaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MovimentacaoFracionada
     */
    omit?: MovimentacaoFracionadaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MovimentacaoFracionadaInclude<ExtArgs> | null
    /**
     * Filter, which MovimentacaoFracionada to fetch.
     */
    where?: MovimentacaoFracionadaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MovimentacaoFracionadas to fetch.
     */
    orderBy?: MovimentacaoFracionadaOrderByWithRelationInput | MovimentacaoFracionadaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MovimentacaoFracionadas.
     */
    cursor?: MovimentacaoFracionadaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MovimentacaoFracionadas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MovimentacaoFracionadas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MovimentacaoFracionadas.
     */
    distinct?: MovimentacaoFracionadaScalarFieldEnum | MovimentacaoFracionadaScalarFieldEnum[]
  }

  /**
   * MovimentacaoFracionada findMany
   */
  export type MovimentacaoFracionadaFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MovimentacaoFracionada
     */
    select?: MovimentacaoFracionadaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MovimentacaoFracionada
     */
    omit?: MovimentacaoFracionadaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MovimentacaoFracionadaInclude<ExtArgs> | null
    /**
     * Filter, which MovimentacaoFracionadas to fetch.
     */
    where?: MovimentacaoFracionadaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MovimentacaoFracionadas to fetch.
     */
    orderBy?: MovimentacaoFracionadaOrderByWithRelationInput | MovimentacaoFracionadaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing MovimentacaoFracionadas.
     */
    cursor?: MovimentacaoFracionadaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MovimentacaoFracionadas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MovimentacaoFracionadas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MovimentacaoFracionadas.
     */
    distinct?: MovimentacaoFracionadaScalarFieldEnum | MovimentacaoFracionadaScalarFieldEnum[]
  }

  /**
   * MovimentacaoFracionada create
   */
  export type MovimentacaoFracionadaCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MovimentacaoFracionada
     */
    select?: MovimentacaoFracionadaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MovimentacaoFracionada
     */
    omit?: MovimentacaoFracionadaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MovimentacaoFracionadaInclude<ExtArgs> | null
    /**
     * The data needed to create a MovimentacaoFracionada.
     */
    data: XOR<MovimentacaoFracionadaCreateInput, MovimentacaoFracionadaUncheckedCreateInput>
  }

  /**
   * MovimentacaoFracionada createMany
   */
  export type MovimentacaoFracionadaCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many MovimentacaoFracionadas.
     */
    data: MovimentacaoFracionadaCreateManyInput | MovimentacaoFracionadaCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * MovimentacaoFracionada createManyAndReturn
   */
  export type MovimentacaoFracionadaCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MovimentacaoFracionada
     */
    select?: MovimentacaoFracionadaSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the MovimentacaoFracionada
     */
    omit?: MovimentacaoFracionadaOmit<ExtArgs> | null
    /**
     * The data used to create many MovimentacaoFracionadas.
     */
    data: MovimentacaoFracionadaCreateManyInput | MovimentacaoFracionadaCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MovimentacaoFracionadaIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * MovimentacaoFracionada update
   */
  export type MovimentacaoFracionadaUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MovimentacaoFracionada
     */
    select?: MovimentacaoFracionadaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MovimentacaoFracionada
     */
    omit?: MovimentacaoFracionadaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MovimentacaoFracionadaInclude<ExtArgs> | null
    /**
     * The data needed to update a MovimentacaoFracionada.
     */
    data: XOR<MovimentacaoFracionadaUpdateInput, MovimentacaoFracionadaUncheckedUpdateInput>
    /**
     * Choose, which MovimentacaoFracionada to update.
     */
    where: MovimentacaoFracionadaWhereUniqueInput
  }

  /**
   * MovimentacaoFracionada updateMany
   */
  export type MovimentacaoFracionadaUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update MovimentacaoFracionadas.
     */
    data: XOR<MovimentacaoFracionadaUpdateManyMutationInput, MovimentacaoFracionadaUncheckedUpdateManyInput>
    /**
     * Filter which MovimentacaoFracionadas to update
     */
    where?: MovimentacaoFracionadaWhereInput
    /**
     * Limit how many MovimentacaoFracionadas to update.
     */
    limit?: number
  }

  /**
   * MovimentacaoFracionada updateManyAndReturn
   */
  export type MovimentacaoFracionadaUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MovimentacaoFracionada
     */
    select?: MovimentacaoFracionadaSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the MovimentacaoFracionada
     */
    omit?: MovimentacaoFracionadaOmit<ExtArgs> | null
    /**
     * The data used to update MovimentacaoFracionadas.
     */
    data: XOR<MovimentacaoFracionadaUpdateManyMutationInput, MovimentacaoFracionadaUncheckedUpdateManyInput>
    /**
     * Filter which MovimentacaoFracionadas to update
     */
    where?: MovimentacaoFracionadaWhereInput
    /**
     * Limit how many MovimentacaoFracionadas to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MovimentacaoFracionadaIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * MovimentacaoFracionada upsert
   */
  export type MovimentacaoFracionadaUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MovimentacaoFracionada
     */
    select?: MovimentacaoFracionadaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MovimentacaoFracionada
     */
    omit?: MovimentacaoFracionadaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MovimentacaoFracionadaInclude<ExtArgs> | null
    /**
     * The filter to search for the MovimentacaoFracionada to update in case it exists.
     */
    where: MovimentacaoFracionadaWhereUniqueInput
    /**
     * In case the MovimentacaoFracionada found by the `where` argument doesn't exist, create a new MovimentacaoFracionada with this data.
     */
    create: XOR<MovimentacaoFracionadaCreateInput, MovimentacaoFracionadaUncheckedCreateInput>
    /**
     * In case the MovimentacaoFracionada was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MovimentacaoFracionadaUpdateInput, MovimentacaoFracionadaUncheckedUpdateInput>
  }

  /**
   * MovimentacaoFracionada delete
   */
  export type MovimentacaoFracionadaDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MovimentacaoFracionada
     */
    select?: MovimentacaoFracionadaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MovimentacaoFracionada
     */
    omit?: MovimentacaoFracionadaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MovimentacaoFracionadaInclude<ExtArgs> | null
    /**
     * Filter which MovimentacaoFracionada to delete.
     */
    where: MovimentacaoFracionadaWhereUniqueInput
  }

  /**
   * MovimentacaoFracionada deleteMany
   */
  export type MovimentacaoFracionadaDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MovimentacaoFracionadas to delete
     */
    where?: MovimentacaoFracionadaWhereInput
    /**
     * Limit how many MovimentacaoFracionadas to delete.
     */
    limit?: number
  }

  /**
   * MovimentacaoFracionada without action
   */
  export type MovimentacaoFracionadaDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MovimentacaoFracionada
     */
    select?: MovimentacaoFracionadaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MovimentacaoFracionada
     */
    omit?: MovimentacaoFracionadaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MovimentacaoFracionadaInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const MedicamentoScalarFieldEnum: {
    id: 'id',
    catmatCodigo: 'catmatCodigo',
    nome: 'nome',
    principioAtivo: 'principioAtivo',
    formaFarmaceutica: 'formaFarmaceutica',
    concentracao: 'concentracao',
    unidadeMedida: 'unidadeMedida',
    quantidadePorEmbalagem: 'quantidadePorEmbalagem',
    estoqueMinimo: 'estoqueMinimo',
    criadoEm: 'criadoEm',
    atualizadoEm: 'atualizadoEm',
    deletedAt: 'deletedAt'
  };

  export type MedicamentoScalarFieldEnum = (typeof MedicamentoScalarFieldEnum)[keyof typeof MedicamentoScalarFieldEnum]


  export const LoteScalarFieldEnum: {
    id: 'id',
    medicamentoId: 'medicamentoId',
    numeroLote: 'numeroLote',
    quantidade: 'quantidade',
    quantidadeAtual: 'quantidadeAtual',
    quantidadeCaixasFechadas: 'quantidadeCaixasFechadas',
    quantidadePorCaixa: 'quantidadePorCaixa',
    validade: 'validade',
    fornecedor: 'fornecedor',
    notaFiscal: 'notaFiscal',
    criadoEm: 'criadoEm',
    deletedAt: 'deletedAt'
  };

  export type LoteScalarFieldEnum = (typeof LoteScalarFieldEnum)[keyof typeof LoteScalarFieldEnum]


  export const PacienteScalarFieldEnum: {
    id: 'id',
    nome: 'nome',
    cpf: 'cpf',
    cartaoSus: 'cartaoSus',
    dataNasc: 'dataNasc',
    telefone: 'telefone',
    endereco: 'endereco',
    criadoEm: 'criadoEm',
    atualizadoEm: 'atualizadoEm',
    deletedAt: 'deletedAt'
  };

  export type PacienteScalarFieldEnum = (typeof PacienteScalarFieldEnum)[keyof typeof PacienteScalarFieldEnum]


  export const PrescricaoScalarFieldEnum: {
    id: 'id',
    pacienteId: 'pacienteId',
    medicoNome: 'medicoNome',
    crm: 'crm',
    dataEmissao: 'dataEmissao',
    dataValidade: 'dataValidade',
    numeroReceita: 'numeroReceita',
    arquivoUrl: 'arquivoUrl',
    observacoes: 'observacoes',
    criadoEm: 'criadoEm',
    deletedAt: 'deletedAt'
  };

  export type PrescricaoScalarFieldEnum = (typeof PrescricaoScalarFieldEnum)[keyof typeof PrescricaoScalarFieldEnum]


  export const DispensacaoScalarFieldEnum: {
    id: 'id',
    pacienteId: 'pacienteId',
    prescricaoId: 'prescricaoId',
    usuarioId: 'usuarioId',
    dataDispensacao: 'dataDispensacao',
    observacoes: 'observacoes',
    criadoEm: 'criadoEm'
  };

  export type DispensacaoScalarFieldEnum = (typeof DispensacaoScalarFieldEnum)[keyof typeof DispensacaoScalarFieldEnum]


  export const DispensacaoItemScalarFieldEnum: {
    id: 'id',
    dispensacaoId: 'dispensacaoId',
    medicamentoId: 'medicamentoId',
    loteId: 'loteId',
    embalagemFracionadaId: 'embalagemFracionadaId',
    quantidade: 'quantidade',
    criadoEm: 'criadoEm'
  };

  export type DispensacaoItemScalarFieldEnum = (typeof DispensacaoItemScalarFieldEnum)[keyof typeof DispensacaoItemScalarFieldEnum]


  export const EmbalageFracionadaScalarFieldEnum: {
    id: 'id',
    loteId: 'loteId',
    medicamentoId: 'medicamentoId',
    codigoQr: 'codigoQr',
    quantidadeAtual: 'quantidadeAtual',
    status: 'status',
    criadoEm: 'criadoEm',
    atualizadoEm: 'atualizadoEm',
    criadoPor: 'criadoPor'
  };

  export type EmbalageFracionadaScalarFieldEnum = (typeof EmbalageFracionadaScalarFieldEnum)[keyof typeof EmbalageFracionadaScalarFieldEnum]


  export const MovimentacaoFracionadaScalarFieldEnum: {
    id: 'id',
    embalagemFracionadaId: 'embalagemFracionadaId',
    tipo: 'tipo',
    quantidadeAnterior: 'quantidadeAnterior',
    quantidadeMovimentada: 'quantidadeMovimentada',
    quantidadeResultante: 'quantidadeResultante',
    codigoQrAnterior: 'codigoQrAnterior',
    codigoQrNovo: 'codigoQrNovo',
    usuarioId: 'usuarioId',
    observacao: 'observacao',
    criadoEm: 'criadoEm'
  };

  export type MovimentacaoFracionadaScalarFieldEnum = (typeof MovimentacaoFracionadaScalarFieldEnum)[keyof typeof MovimentacaoFracionadaScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type MedicamentoWhereInput = {
    AND?: MedicamentoWhereInput | MedicamentoWhereInput[]
    OR?: MedicamentoWhereInput[]
    NOT?: MedicamentoWhereInput | MedicamentoWhereInput[]
    id?: StringFilter<"Medicamento"> | string
    catmatCodigo?: StringNullableFilter<"Medicamento"> | string | null
    nome?: StringFilter<"Medicamento"> | string
    principioAtivo?: StringNullableFilter<"Medicamento"> | string | null
    formaFarmaceutica?: StringNullableFilter<"Medicamento"> | string | null
    concentracao?: StringNullableFilter<"Medicamento"> | string | null
    unidadeMedida?: StringFilter<"Medicamento"> | string
    quantidadePorEmbalagem?: IntFilter<"Medicamento"> | number
    estoqueMinimo?: IntFilter<"Medicamento"> | number
    criadoEm?: DateTimeFilter<"Medicamento"> | Date | string
    atualizadoEm?: DateTimeFilter<"Medicamento"> | Date | string
    deletedAt?: DateTimeNullableFilter<"Medicamento"> | Date | string | null
    lotes?: LoteListRelationFilter
    dispensacaoItens?: DispensacaoItemListRelationFilter
    embalagensFracionadas?: EmbalageFracionadaListRelationFilter
  }

  export type MedicamentoOrderByWithRelationInput = {
    id?: SortOrder
    catmatCodigo?: SortOrderInput | SortOrder
    nome?: SortOrder
    principioAtivo?: SortOrderInput | SortOrder
    formaFarmaceutica?: SortOrderInput | SortOrder
    concentracao?: SortOrderInput | SortOrder
    unidadeMedida?: SortOrder
    quantidadePorEmbalagem?: SortOrder
    estoqueMinimo?: SortOrder
    criadoEm?: SortOrder
    atualizadoEm?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    lotes?: LoteOrderByRelationAggregateInput
    dispensacaoItens?: DispensacaoItemOrderByRelationAggregateInput
    embalagensFracionadas?: EmbalageFracionadaOrderByRelationAggregateInput
  }

  export type MedicamentoWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: MedicamentoWhereInput | MedicamentoWhereInput[]
    OR?: MedicamentoWhereInput[]
    NOT?: MedicamentoWhereInput | MedicamentoWhereInput[]
    catmatCodigo?: StringNullableFilter<"Medicamento"> | string | null
    nome?: StringFilter<"Medicamento"> | string
    principioAtivo?: StringNullableFilter<"Medicamento"> | string | null
    formaFarmaceutica?: StringNullableFilter<"Medicamento"> | string | null
    concentracao?: StringNullableFilter<"Medicamento"> | string | null
    unidadeMedida?: StringFilter<"Medicamento"> | string
    quantidadePorEmbalagem?: IntFilter<"Medicamento"> | number
    estoqueMinimo?: IntFilter<"Medicamento"> | number
    criadoEm?: DateTimeFilter<"Medicamento"> | Date | string
    atualizadoEm?: DateTimeFilter<"Medicamento"> | Date | string
    deletedAt?: DateTimeNullableFilter<"Medicamento"> | Date | string | null
    lotes?: LoteListRelationFilter
    dispensacaoItens?: DispensacaoItemListRelationFilter
    embalagensFracionadas?: EmbalageFracionadaListRelationFilter
  }, "id">

  export type MedicamentoOrderByWithAggregationInput = {
    id?: SortOrder
    catmatCodigo?: SortOrderInput | SortOrder
    nome?: SortOrder
    principioAtivo?: SortOrderInput | SortOrder
    formaFarmaceutica?: SortOrderInput | SortOrder
    concentracao?: SortOrderInput | SortOrder
    unidadeMedida?: SortOrder
    quantidadePorEmbalagem?: SortOrder
    estoqueMinimo?: SortOrder
    criadoEm?: SortOrder
    atualizadoEm?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    _count?: MedicamentoCountOrderByAggregateInput
    _avg?: MedicamentoAvgOrderByAggregateInput
    _max?: MedicamentoMaxOrderByAggregateInput
    _min?: MedicamentoMinOrderByAggregateInput
    _sum?: MedicamentoSumOrderByAggregateInput
  }

  export type MedicamentoScalarWhereWithAggregatesInput = {
    AND?: MedicamentoScalarWhereWithAggregatesInput | MedicamentoScalarWhereWithAggregatesInput[]
    OR?: MedicamentoScalarWhereWithAggregatesInput[]
    NOT?: MedicamentoScalarWhereWithAggregatesInput | MedicamentoScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Medicamento"> | string
    catmatCodigo?: StringNullableWithAggregatesFilter<"Medicamento"> | string | null
    nome?: StringWithAggregatesFilter<"Medicamento"> | string
    principioAtivo?: StringNullableWithAggregatesFilter<"Medicamento"> | string | null
    formaFarmaceutica?: StringNullableWithAggregatesFilter<"Medicamento"> | string | null
    concentracao?: StringNullableWithAggregatesFilter<"Medicamento"> | string | null
    unidadeMedida?: StringWithAggregatesFilter<"Medicamento"> | string
    quantidadePorEmbalagem?: IntWithAggregatesFilter<"Medicamento"> | number
    estoqueMinimo?: IntWithAggregatesFilter<"Medicamento"> | number
    criadoEm?: DateTimeWithAggregatesFilter<"Medicamento"> | Date | string
    atualizadoEm?: DateTimeWithAggregatesFilter<"Medicamento"> | Date | string
    deletedAt?: DateTimeNullableWithAggregatesFilter<"Medicamento"> | Date | string | null
  }

  export type LoteWhereInput = {
    AND?: LoteWhereInput | LoteWhereInput[]
    OR?: LoteWhereInput[]
    NOT?: LoteWhereInput | LoteWhereInput[]
    id?: StringFilter<"Lote"> | string
    medicamentoId?: StringFilter<"Lote"> | string
    numeroLote?: StringFilter<"Lote"> | string
    quantidade?: IntFilter<"Lote"> | number
    quantidadeAtual?: IntFilter<"Lote"> | number
    quantidadeCaixasFechadas?: IntFilter<"Lote"> | number
    quantidadePorCaixa?: IntFilter<"Lote"> | number
    validade?: DateTimeFilter<"Lote"> | Date | string
    fornecedor?: StringNullableFilter<"Lote"> | string | null
    notaFiscal?: StringNullableFilter<"Lote"> | string | null
    criadoEm?: DateTimeFilter<"Lote"> | Date | string
    deletedAt?: DateTimeNullableFilter<"Lote"> | Date | string | null
    medicamento?: XOR<MedicamentoScalarRelationFilter, MedicamentoWhereInput>
    dispensacaoItens?: DispensacaoItemListRelationFilter
    embalagensFracionadas?: EmbalageFracionadaListRelationFilter
  }

  export type LoteOrderByWithRelationInput = {
    id?: SortOrder
    medicamentoId?: SortOrder
    numeroLote?: SortOrder
    quantidade?: SortOrder
    quantidadeAtual?: SortOrder
    quantidadeCaixasFechadas?: SortOrder
    quantidadePorCaixa?: SortOrder
    validade?: SortOrder
    fornecedor?: SortOrderInput | SortOrder
    notaFiscal?: SortOrderInput | SortOrder
    criadoEm?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    medicamento?: MedicamentoOrderByWithRelationInput
    dispensacaoItens?: DispensacaoItemOrderByRelationAggregateInput
    embalagensFracionadas?: EmbalageFracionadaOrderByRelationAggregateInput
  }

  export type LoteWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: LoteWhereInput | LoteWhereInput[]
    OR?: LoteWhereInput[]
    NOT?: LoteWhereInput | LoteWhereInput[]
    medicamentoId?: StringFilter<"Lote"> | string
    numeroLote?: StringFilter<"Lote"> | string
    quantidade?: IntFilter<"Lote"> | number
    quantidadeAtual?: IntFilter<"Lote"> | number
    quantidadeCaixasFechadas?: IntFilter<"Lote"> | number
    quantidadePorCaixa?: IntFilter<"Lote"> | number
    validade?: DateTimeFilter<"Lote"> | Date | string
    fornecedor?: StringNullableFilter<"Lote"> | string | null
    notaFiscal?: StringNullableFilter<"Lote"> | string | null
    criadoEm?: DateTimeFilter<"Lote"> | Date | string
    deletedAt?: DateTimeNullableFilter<"Lote"> | Date | string | null
    medicamento?: XOR<MedicamentoScalarRelationFilter, MedicamentoWhereInput>
    dispensacaoItens?: DispensacaoItemListRelationFilter
    embalagensFracionadas?: EmbalageFracionadaListRelationFilter
  }, "id">

  export type LoteOrderByWithAggregationInput = {
    id?: SortOrder
    medicamentoId?: SortOrder
    numeroLote?: SortOrder
    quantidade?: SortOrder
    quantidadeAtual?: SortOrder
    quantidadeCaixasFechadas?: SortOrder
    quantidadePorCaixa?: SortOrder
    validade?: SortOrder
    fornecedor?: SortOrderInput | SortOrder
    notaFiscal?: SortOrderInput | SortOrder
    criadoEm?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    _count?: LoteCountOrderByAggregateInput
    _avg?: LoteAvgOrderByAggregateInput
    _max?: LoteMaxOrderByAggregateInput
    _min?: LoteMinOrderByAggregateInput
    _sum?: LoteSumOrderByAggregateInput
  }

  export type LoteScalarWhereWithAggregatesInput = {
    AND?: LoteScalarWhereWithAggregatesInput | LoteScalarWhereWithAggregatesInput[]
    OR?: LoteScalarWhereWithAggregatesInput[]
    NOT?: LoteScalarWhereWithAggregatesInput | LoteScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Lote"> | string
    medicamentoId?: StringWithAggregatesFilter<"Lote"> | string
    numeroLote?: StringWithAggregatesFilter<"Lote"> | string
    quantidade?: IntWithAggregatesFilter<"Lote"> | number
    quantidadeAtual?: IntWithAggregatesFilter<"Lote"> | number
    quantidadeCaixasFechadas?: IntWithAggregatesFilter<"Lote"> | number
    quantidadePorCaixa?: IntWithAggregatesFilter<"Lote"> | number
    validade?: DateTimeWithAggregatesFilter<"Lote"> | Date | string
    fornecedor?: StringNullableWithAggregatesFilter<"Lote"> | string | null
    notaFiscal?: StringNullableWithAggregatesFilter<"Lote"> | string | null
    criadoEm?: DateTimeWithAggregatesFilter<"Lote"> | Date | string
    deletedAt?: DateTimeNullableWithAggregatesFilter<"Lote"> | Date | string | null
  }

  export type PacienteWhereInput = {
    AND?: PacienteWhereInput | PacienteWhereInput[]
    OR?: PacienteWhereInput[]
    NOT?: PacienteWhereInput | PacienteWhereInput[]
    id?: StringFilter<"Paciente"> | string
    nome?: StringFilter<"Paciente"> | string
    cpf?: StringNullableFilter<"Paciente"> | string | null
    cartaoSus?: StringNullableFilter<"Paciente"> | string | null
    dataNasc?: DateTimeNullableFilter<"Paciente"> | Date | string | null
    telefone?: StringNullableFilter<"Paciente"> | string | null
    endereco?: StringNullableFilter<"Paciente"> | string | null
    criadoEm?: DateTimeFilter<"Paciente"> | Date | string
    atualizadoEm?: DateTimeFilter<"Paciente"> | Date | string
    deletedAt?: DateTimeNullableFilter<"Paciente"> | Date | string | null
    prescricoes?: PrescricaoListRelationFilter
    dispensacoes?: DispensacaoListRelationFilter
  }

  export type PacienteOrderByWithRelationInput = {
    id?: SortOrder
    nome?: SortOrder
    cpf?: SortOrderInput | SortOrder
    cartaoSus?: SortOrderInput | SortOrder
    dataNasc?: SortOrderInput | SortOrder
    telefone?: SortOrderInput | SortOrder
    endereco?: SortOrderInput | SortOrder
    criadoEm?: SortOrder
    atualizadoEm?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    prescricoes?: PrescricaoOrderByRelationAggregateInput
    dispensacoes?: DispensacaoOrderByRelationAggregateInput
  }

  export type PacienteWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    cpf?: string
    cartaoSus?: string
    AND?: PacienteWhereInput | PacienteWhereInput[]
    OR?: PacienteWhereInput[]
    NOT?: PacienteWhereInput | PacienteWhereInput[]
    nome?: StringFilter<"Paciente"> | string
    dataNasc?: DateTimeNullableFilter<"Paciente"> | Date | string | null
    telefone?: StringNullableFilter<"Paciente"> | string | null
    endereco?: StringNullableFilter<"Paciente"> | string | null
    criadoEm?: DateTimeFilter<"Paciente"> | Date | string
    atualizadoEm?: DateTimeFilter<"Paciente"> | Date | string
    deletedAt?: DateTimeNullableFilter<"Paciente"> | Date | string | null
    prescricoes?: PrescricaoListRelationFilter
    dispensacoes?: DispensacaoListRelationFilter
  }, "id" | "cpf" | "cartaoSus">

  export type PacienteOrderByWithAggregationInput = {
    id?: SortOrder
    nome?: SortOrder
    cpf?: SortOrderInput | SortOrder
    cartaoSus?: SortOrderInput | SortOrder
    dataNasc?: SortOrderInput | SortOrder
    telefone?: SortOrderInput | SortOrder
    endereco?: SortOrderInput | SortOrder
    criadoEm?: SortOrder
    atualizadoEm?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    _count?: PacienteCountOrderByAggregateInput
    _max?: PacienteMaxOrderByAggregateInput
    _min?: PacienteMinOrderByAggregateInput
  }

  export type PacienteScalarWhereWithAggregatesInput = {
    AND?: PacienteScalarWhereWithAggregatesInput | PacienteScalarWhereWithAggregatesInput[]
    OR?: PacienteScalarWhereWithAggregatesInput[]
    NOT?: PacienteScalarWhereWithAggregatesInput | PacienteScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Paciente"> | string
    nome?: StringWithAggregatesFilter<"Paciente"> | string
    cpf?: StringNullableWithAggregatesFilter<"Paciente"> | string | null
    cartaoSus?: StringNullableWithAggregatesFilter<"Paciente"> | string | null
    dataNasc?: DateTimeNullableWithAggregatesFilter<"Paciente"> | Date | string | null
    telefone?: StringNullableWithAggregatesFilter<"Paciente"> | string | null
    endereco?: StringNullableWithAggregatesFilter<"Paciente"> | string | null
    criadoEm?: DateTimeWithAggregatesFilter<"Paciente"> | Date | string
    atualizadoEm?: DateTimeWithAggregatesFilter<"Paciente"> | Date | string
    deletedAt?: DateTimeNullableWithAggregatesFilter<"Paciente"> | Date | string | null
  }

  export type PrescricaoWhereInput = {
    AND?: PrescricaoWhereInput | PrescricaoWhereInput[]
    OR?: PrescricaoWhereInput[]
    NOT?: PrescricaoWhereInput | PrescricaoWhereInput[]
    id?: StringFilter<"Prescricao"> | string
    pacienteId?: StringFilter<"Prescricao"> | string
    medicoNome?: StringNullableFilter<"Prescricao"> | string | null
    crm?: StringNullableFilter<"Prescricao"> | string | null
    dataEmissao?: DateTimeFilter<"Prescricao"> | Date | string
    dataValidade?: DateTimeNullableFilter<"Prescricao"> | Date | string | null
    numeroReceita?: StringNullableFilter<"Prescricao"> | string | null
    arquivoUrl?: StringNullableFilter<"Prescricao"> | string | null
    observacoes?: StringNullableFilter<"Prescricao"> | string | null
    criadoEm?: DateTimeFilter<"Prescricao"> | Date | string
    deletedAt?: DateTimeNullableFilter<"Prescricao"> | Date | string | null
    paciente?: XOR<PacienteScalarRelationFilter, PacienteWhereInput>
    dispensacoes?: DispensacaoListRelationFilter
  }

  export type PrescricaoOrderByWithRelationInput = {
    id?: SortOrder
    pacienteId?: SortOrder
    medicoNome?: SortOrderInput | SortOrder
    crm?: SortOrderInput | SortOrder
    dataEmissao?: SortOrder
    dataValidade?: SortOrderInput | SortOrder
    numeroReceita?: SortOrderInput | SortOrder
    arquivoUrl?: SortOrderInput | SortOrder
    observacoes?: SortOrderInput | SortOrder
    criadoEm?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    paciente?: PacienteOrderByWithRelationInput
    dispensacoes?: DispensacaoOrderByRelationAggregateInput
  }

  export type PrescricaoWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: PrescricaoWhereInput | PrescricaoWhereInput[]
    OR?: PrescricaoWhereInput[]
    NOT?: PrescricaoWhereInput | PrescricaoWhereInput[]
    pacienteId?: StringFilter<"Prescricao"> | string
    medicoNome?: StringNullableFilter<"Prescricao"> | string | null
    crm?: StringNullableFilter<"Prescricao"> | string | null
    dataEmissao?: DateTimeFilter<"Prescricao"> | Date | string
    dataValidade?: DateTimeNullableFilter<"Prescricao"> | Date | string | null
    numeroReceita?: StringNullableFilter<"Prescricao"> | string | null
    arquivoUrl?: StringNullableFilter<"Prescricao"> | string | null
    observacoes?: StringNullableFilter<"Prescricao"> | string | null
    criadoEm?: DateTimeFilter<"Prescricao"> | Date | string
    deletedAt?: DateTimeNullableFilter<"Prescricao"> | Date | string | null
    paciente?: XOR<PacienteScalarRelationFilter, PacienteWhereInput>
    dispensacoes?: DispensacaoListRelationFilter
  }, "id">

  export type PrescricaoOrderByWithAggregationInput = {
    id?: SortOrder
    pacienteId?: SortOrder
    medicoNome?: SortOrderInput | SortOrder
    crm?: SortOrderInput | SortOrder
    dataEmissao?: SortOrder
    dataValidade?: SortOrderInput | SortOrder
    numeroReceita?: SortOrderInput | SortOrder
    arquivoUrl?: SortOrderInput | SortOrder
    observacoes?: SortOrderInput | SortOrder
    criadoEm?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    _count?: PrescricaoCountOrderByAggregateInput
    _max?: PrescricaoMaxOrderByAggregateInput
    _min?: PrescricaoMinOrderByAggregateInput
  }

  export type PrescricaoScalarWhereWithAggregatesInput = {
    AND?: PrescricaoScalarWhereWithAggregatesInput | PrescricaoScalarWhereWithAggregatesInput[]
    OR?: PrescricaoScalarWhereWithAggregatesInput[]
    NOT?: PrescricaoScalarWhereWithAggregatesInput | PrescricaoScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Prescricao"> | string
    pacienteId?: StringWithAggregatesFilter<"Prescricao"> | string
    medicoNome?: StringNullableWithAggregatesFilter<"Prescricao"> | string | null
    crm?: StringNullableWithAggregatesFilter<"Prescricao"> | string | null
    dataEmissao?: DateTimeWithAggregatesFilter<"Prescricao"> | Date | string
    dataValidade?: DateTimeNullableWithAggregatesFilter<"Prescricao"> | Date | string | null
    numeroReceita?: StringNullableWithAggregatesFilter<"Prescricao"> | string | null
    arquivoUrl?: StringNullableWithAggregatesFilter<"Prescricao"> | string | null
    observacoes?: StringNullableWithAggregatesFilter<"Prescricao"> | string | null
    criadoEm?: DateTimeWithAggregatesFilter<"Prescricao"> | Date | string
    deletedAt?: DateTimeNullableWithAggregatesFilter<"Prescricao"> | Date | string | null
  }

  export type DispensacaoWhereInput = {
    AND?: DispensacaoWhereInput | DispensacaoWhereInput[]
    OR?: DispensacaoWhereInput[]
    NOT?: DispensacaoWhereInput | DispensacaoWhereInput[]
    id?: StringFilter<"Dispensacao"> | string
    pacienteId?: StringFilter<"Dispensacao"> | string
    prescricaoId?: StringNullableFilter<"Dispensacao"> | string | null
    usuarioId?: StringFilter<"Dispensacao"> | string
    dataDispensacao?: DateTimeFilter<"Dispensacao"> | Date | string
    observacoes?: StringNullableFilter<"Dispensacao"> | string | null
    criadoEm?: DateTimeFilter<"Dispensacao"> | Date | string
    paciente?: XOR<PacienteScalarRelationFilter, PacienteWhereInput>
    prescricao?: XOR<PrescricaoNullableScalarRelationFilter, PrescricaoWhereInput> | null
    itens?: DispensacaoItemListRelationFilter
  }

  export type DispensacaoOrderByWithRelationInput = {
    id?: SortOrder
    pacienteId?: SortOrder
    prescricaoId?: SortOrderInput | SortOrder
    usuarioId?: SortOrder
    dataDispensacao?: SortOrder
    observacoes?: SortOrderInput | SortOrder
    criadoEm?: SortOrder
    paciente?: PacienteOrderByWithRelationInput
    prescricao?: PrescricaoOrderByWithRelationInput
    itens?: DispensacaoItemOrderByRelationAggregateInput
  }

  export type DispensacaoWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: DispensacaoWhereInput | DispensacaoWhereInput[]
    OR?: DispensacaoWhereInput[]
    NOT?: DispensacaoWhereInput | DispensacaoWhereInput[]
    pacienteId?: StringFilter<"Dispensacao"> | string
    prescricaoId?: StringNullableFilter<"Dispensacao"> | string | null
    usuarioId?: StringFilter<"Dispensacao"> | string
    dataDispensacao?: DateTimeFilter<"Dispensacao"> | Date | string
    observacoes?: StringNullableFilter<"Dispensacao"> | string | null
    criadoEm?: DateTimeFilter<"Dispensacao"> | Date | string
    paciente?: XOR<PacienteScalarRelationFilter, PacienteWhereInput>
    prescricao?: XOR<PrescricaoNullableScalarRelationFilter, PrescricaoWhereInput> | null
    itens?: DispensacaoItemListRelationFilter
  }, "id">

  export type DispensacaoOrderByWithAggregationInput = {
    id?: SortOrder
    pacienteId?: SortOrder
    prescricaoId?: SortOrderInput | SortOrder
    usuarioId?: SortOrder
    dataDispensacao?: SortOrder
    observacoes?: SortOrderInput | SortOrder
    criadoEm?: SortOrder
    _count?: DispensacaoCountOrderByAggregateInput
    _max?: DispensacaoMaxOrderByAggregateInput
    _min?: DispensacaoMinOrderByAggregateInput
  }

  export type DispensacaoScalarWhereWithAggregatesInput = {
    AND?: DispensacaoScalarWhereWithAggregatesInput | DispensacaoScalarWhereWithAggregatesInput[]
    OR?: DispensacaoScalarWhereWithAggregatesInput[]
    NOT?: DispensacaoScalarWhereWithAggregatesInput | DispensacaoScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Dispensacao"> | string
    pacienteId?: StringWithAggregatesFilter<"Dispensacao"> | string
    prescricaoId?: StringNullableWithAggregatesFilter<"Dispensacao"> | string | null
    usuarioId?: StringWithAggregatesFilter<"Dispensacao"> | string
    dataDispensacao?: DateTimeWithAggregatesFilter<"Dispensacao"> | Date | string
    observacoes?: StringNullableWithAggregatesFilter<"Dispensacao"> | string | null
    criadoEm?: DateTimeWithAggregatesFilter<"Dispensacao"> | Date | string
  }

  export type DispensacaoItemWhereInput = {
    AND?: DispensacaoItemWhereInput | DispensacaoItemWhereInput[]
    OR?: DispensacaoItemWhereInput[]
    NOT?: DispensacaoItemWhereInput | DispensacaoItemWhereInput[]
    id?: StringFilter<"DispensacaoItem"> | string
    dispensacaoId?: StringFilter<"DispensacaoItem"> | string
    medicamentoId?: StringFilter<"DispensacaoItem"> | string
    loteId?: StringNullableFilter<"DispensacaoItem"> | string | null
    embalagemFracionadaId?: StringNullableFilter<"DispensacaoItem"> | string | null
    quantidade?: IntFilter<"DispensacaoItem"> | number
    criadoEm?: DateTimeFilter<"DispensacaoItem"> | Date | string
    dispensacao?: XOR<DispensacaoScalarRelationFilter, DispensacaoWhereInput>
    medicamento?: XOR<MedicamentoScalarRelationFilter, MedicamentoWhereInput>
    lote?: XOR<LoteNullableScalarRelationFilter, LoteWhereInput> | null
    embalagem?: XOR<EmbalageFracionadaNullableScalarRelationFilter, EmbalageFracionadaWhereInput> | null
  }

  export type DispensacaoItemOrderByWithRelationInput = {
    id?: SortOrder
    dispensacaoId?: SortOrder
    medicamentoId?: SortOrder
    loteId?: SortOrderInput | SortOrder
    embalagemFracionadaId?: SortOrderInput | SortOrder
    quantidade?: SortOrder
    criadoEm?: SortOrder
    dispensacao?: DispensacaoOrderByWithRelationInput
    medicamento?: MedicamentoOrderByWithRelationInput
    lote?: LoteOrderByWithRelationInput
    embalagem?: EmbalageFracionadaOrderByWithRelationInput
  }

  export type DispensacaoItemWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: DispensacaoItemWhereInput | DispensacaoItemWhereInput[]
    OR?: DispensacaoItemWhereInput[]
    NOT?: DispensacaoItemWhereInput | DispensacaoItemWhereInput[]
    dispensacaoId?: StringFilter<"DispensacaoItem"> | string
    medicamentoId?: StringFilter<"DispensacaoItem"> | string
    loteId?: StringNullableFilter<"DispensacaoItem"> | string | null
    embalagemFracionadaId?: StringNullableFilter<"DispensacaoItem"> | string | null
    quantidade?: IntFilter<"DispensacaoItem"> | number
    criadoEm?: DateTimeFilter<"DispensacaoItem"> | Date | string
    dispensacao?: XOR<DispensacaoScalarRelationFilter, DispensacaoWhereInput>
    medicamento?: XOR<MedicamentoScalarRelationFilter, MedicamentoWhereInput>
    lote?: XOR<LoteNullableScalarRelationFilter, LoteWhereInput> | null
    embalagem?: XOR<EmbalageFracionadaNullableScalarRelationFilter, EmbalageFracionadaWhereInput> | null
  }, "id">

  export type DispensacaoItemOrderByWithAggregationInput = {
    id?: SortOrder
    dispensacaoId?: SortOrder
    medicamentoId?: SortOrder
    loteId?: SortOrderInput | SortOrder
    embalagemFracionadaId?: SortOrderInput | SortOrder
    quantidade?: SortOrder
    criadoEm?: SortOrder
    _count?: DispensacaoItemCountOrderByAggregateInput
    _avg?: DispensacaoItemAvgOrderByAggregateInput
    _max?: DispensacaoItemMaxOrderByAggregateInput
    _min?: DispensacaoItemMinOrderByAggregateInput
    _sum?: DispensacaoItemSumOrderByAggregateInput
  }

  export type DispensacaoItemScalarWhereWithAggregatesInput = {
    AND?: DispensacaoItemScalarWhereWithAggregatesInput | DispensacaoItemScalarWhereWithAggregatesInput[]
    OR?: DispensacaoItemScalarWhereWithAggregatesInput[]
    NOT?: DispensacaoItemScalarWhereWithAggregatesInput | DispensacaoItemScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"DispensacaoItem"> | string
    dispensacaoId?: StringWithAggregatesFilter<"DispensacaoItem"> | string
    medicamentoId?: StringWithAggregatesFilter<"DispensacaoItem"> | string
    loteId?: StringNullableWithAggregatesFilter<"DispensacaoItem"> | string | null
    embalagemFracionadaId?: StringNullableWithAggregatesFilter<"DispensacaoItem"> | string | null
    quantidade?: IntWithAggregatesFilter<"DispensacaoItem"> | number
    criadoEm?: DateTimeWithAggregatesFilter<"DispensacaoItem"> | Date | string
  }

  export type EmbalageFracionadaWhereInput = {
    AND?: EmbalageFracionadaWhereInput | EmbalageFracionadaWhereInput[]
    OR?: EmbalageFracionadaWhereInput[]
    NOT?: EmbalageFracionadaWhereInput | EmbalageFracionadaWhereInput[]
    id?: StringFilter<"EmbalageFracionada"> | string
    loteId?: StringFilter<"EmbalageFracionada"> | string
    medicamentoId?: StringFilter<"EmbalageFracionada"> | string
    codigoQr?: StringFilter<"EmbalageFracionada"> | string
    quantidadeAtual?: IntFilter<"EmbalageFracionada"> | number
    status?: StringFilter<"EmbalageFracionada"> | string
    criadoEm?: DateTimeFilter<"EmbalageFracionada"> | Date | string
    atualizadoEm?: DateTimeFilter<"EmbalageFracionada"> | Date | string
    criadoPor?: StringFilter<"EmbalageFracionada"> | string
    lote?: XOR<LoteScalarRelationFilter, LoteWhereInput>
    medicamento?: XOR<MedicamentoScalarRelationFilter, MedicamentoWhereInput>
    dispensacaoItens?: DispensacaoItemListRelationFilter
    movimentacoes?: MovimentacaoFracionadaListRelationFilter
  }

  export type EmbalageFracionadaOrderByWithRelationInput = {
    id?: SortOrder
    loteId?: SortOrder
    medicamentoId?: SortOrder
    codigoQr?: SortOrder
    quantidadeAtual?: SortOrder
    status?: SortOrder
    criadoEm?: SortOrder
    atualizadoEm?: SortOrder
    criadoPor?: SortOrder
    lote?: LoteOrderByWithRelationInput
    medicamento?: MedicamentoOrderByWithRelationInput
    dispensacaoItens?: DispensacaoItemOrderByRelationAggregateInput
    movimentacoes?: MovimentacaoFracionadaOrderByRelationAggregateInput
  }

  export type EmbalageFracionadaWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    codigoQr?: string
    AND?: EmbalageFracionadaWhereInput | EmbalageFracionadaWhereInput[]
    OR?: EmbalageFracionadaWhereInput[]
    NOT?: EmbalageFracionadaWhereInput | EmbalageFracionadaWhereInput[]
    loteId?: StringFilter<"EmbalageFracionada"> | string
    medicamentoId?: StringFilter<"EmbalageFracionada"> | string
    quantidadeAtual?: IntFilter<"EmbalageFracionada"> | number
    status?: StringFilter<"EmbalageFracionada"> | string
    criadoEm?: DateTimeFilter<"EmbalageFracionada"> | Date | string
    atualizadoEm?: DateTimeFilter<"EmbalageFracionada"> | Date | string
    criadoPor?: StringFilter<"EmbalageFracionada"> | string
    lote?: XOR<LoteScalarRelationFilter, LoteWhereInput>
    medicamento?: XOR<MedicamentoScalarRelationFilter, MedicamentoWhereInput>
    dispensacaoItens?: DispensacaoItemListRelationFilter
    movimentacoes?: MovimentacaoFracionadaListRelationFilter
  }, "id" | "codigoQr">

  export type EmbalageFracionadaOrderByWithAggregationInput = {
    id?: SortOrder
    loteId?: SortOrder
    medicamentoId?: SortOrder
    codigoQr?: SortOrder
    quantidadeAtual?: SortOrder
    status?: SortOrder
    criadoEm?: SortOrder
    atualizadoEm?: SortOrder
    criadoPor?: SortOrder
    _count?: EmbalageFracionadaCountOrderByAggregateInput
    _avg?: EmbalageFracionadaAvgOrderByAggregateInput
    _max?: EmbalageFracionadaMaxOrderByAggregateInput
    _min?: EmbalageFracionadaMinOrderByAggregateInput
    _sum?: EmbalageFracionadaSumOrderByAggregateInput
  }

  export type EmbalageFracionadaScalarWhereWithAggregatesInput = {
    AND?: EmbalageFracionadaScalarWhereWithAggregatesInput | EmbalageFracionadaScalarWhereWithAggregatesInput[]
    OR?: EmbalageFracionadaScalarWhereWithAggregatesInput[]
    NOT?: EmbalageFracionadaScalarWhereWithAggregatesInput | EmbalageFracionadaScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"EmbalageFracionada"> | string
    loteId?: StringWithAggregatesFilter<"EmbalageFracionada"> | string
    medicamentoId?: StringWithAggregatesFilter<"EmbalageFracionada"> | string
    codigoQr?: StringWithAggregatesFilter<"EmbalageFracionada"> | string
    quantidadeAtual?: IntWithAggregatesFilter<"EmbalageFracionada"> | number
    status?: StringWithAggregatesFilter<"EmbalageFracionada"> | string
    criadoEm?: DateTimeWithAggregatesFilter<"EmbalageFracionada"> | Date | string
    atualizadoEm?: DateTimeWithAggregatesFilter<"EmbalageFracionada"> | Date | string
    criadoPor?: StringWithAggregatesFilter<"EmbalageFracionada"> | string
  }

  export type MovimentacaoFracionadaWhereInput = {
    AND?: MovimentacaoFracionadaWhereInput | MovimentacaoFracionadaWhereInput[]
    OR?: MovimentacaoFracionadaWhereInput[]
    NOT?: MovimentacaoFracionadaWhereInput | MovimentacaoFracionadaWhereInput[]
    id?: StringFilter<"MovimentacaoFracionada"> | string
    embalagemFracionadaId?: StringFilter<"MovimentacaoFracionada"> | string
    tipo?: StringFilter<"MovimentacaoFracionada"> | string
    quantidadeAnterior?: IntFilter<"MovimentacaoFracionada"> | number
    quantidadeMovimentada?: IntFilter<"MovimentacaoFracionada"> | number
    quantidadeResultante?: IntFilter<"MovimentacaoFracionada"> | number
    codigoQrAnterior?: StringNullableFilter<"MovimentacaoFracionada"> | string | null
    codigoQrNovo?: StringNullableFilter<"MovimentacaoFracionada"> | string | null
    usuarioId?: StringFilter<"MovimentacaoFracionada"> | string
    observacao?: StringNullableFilter<"MovimentacaoFracionada"> | string | null
    criadoEm?: DateTimeFilter<"MovimentacaoFracionada"> | Date | string
    embalagem?: XOR<EmbalageFracionadaScalarRelationFilter, EmbalageFracionadaWhereInput>
  }

  export type MovimentacaoFracionadaOrderByWithRelationInput = {
    id?: SortOrder
    embalagemFracionadaId?: SortOrder
    tipo?: SortOrder
    quantidadeAnterior?: SortOrder
    quantidadeMovimentada?: SortOrder
    quantidadeResultante?: SortOrder
    codigoQrAnterior?: SortOrderInput | SortOrder
    codigoQrNovo?: SortOrderInput | SortOrder
    usuarioId?: SortOrder
    observacao?: SortOrderInput | SortOrder
    criadoEm?: SortOrder
    embalagem?: EmbalageFracionadaOrderByWithRelationInput
  }

  export type MovimentacaoFracionadaWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: MovimentacaoFracionadaWhereInput | MovimentacaoFracionadaWhereInput[]
    OR?: MovimentacaoFracionadaWhereInput[]
    NOT?: MovimentacaoFracionadaWhereInput | MovimentacaoFracionadaWhereInput[]
    embalagemFracionadaId?: StringFilter<"MovimentacaoFracionada"> | string
    tipo?: StringFilter<"MovimentacaoFracionada"> | string
    quantidadeAnterior?: IntFilter<"MovimentacaoFracionada"> | number
    quantidadeMovimentada?: IntFilter<"MovimentacaoFracionada"> | number
    quantidadeResultante?: IntFilter<"MovimentacaoFracionada"> | number
    codigoQrAnterior?: StringNullableFilter<"MovimentacaoFracionada"> | string | null
    codigoQrNovo?: StringNullableFilter<"MovimentacaoFracionada"> | string | null
    usuarioId?: StringFilter<"MovimentacaoFracionada"> | string
    observacao?: StringNullableFilter<"MovimentacaoFracionada"> | string | null
    criadoEm?: DateTimeFilter<"MovimentacaoFracionada"> | Date | string
    embalagem?: XOR<EmbalageFracionadaScalarRelationFilter, EmbalageFracionadaWhereInput>
  }, "id">

  export type MovimentacaoFracionadaOrderByWithAggregationInput = {
    id?: SortOrder
    embalagemFracionadaId?: SortOrder
    tipo?: SortOrder
    quantidadeAnterior?: SortOrder
    quantidadeMovimentada?: SortOrder
    quantidadeResultante?: SortOrder
    codigoQrAnterior?: SortOrderInput | SortOrder
    codigoQrNovo?: SortOrderInput | SortOrder
    usuarioId?: SortOrder
    observacao?: SortOrderInput | SortOrder
    criadoEm?: SortOrder
    _count?: MovimentacaoFracionadaCountOrderByAggregateInput
    _avg?: MovimentacaoFracionadaAvgOrderByAggregateInput
    _max?: MovimentacaoFracionadaMaxOrderByAggregateInput
    _min?: MovimentacaoFracionadaMinOrderByAggregateInput
    _sum?: MovimentacaoFracionadaSumOrderByAggregateInput
  }

  export type MovimentacaoFracionadaScalarWhereWithAggregatesInput = {
    AND?: MovimentacaoFracionadaScalarWhereWithAggregatesInput | MovimentacaoFracionadaScalarWhereWithAggregatesInput[]
    OR?: MovimentacaoFracionadaScalarWhereWithAggregatesInput[]
    NOT?: MovimentacaoFracionadaScalarWhereWithAggregatesInput | MovimentacaoFracionadaScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"MovimentacaoFracionada"> | string
    embalagemFracionadaId?: StringWithAggregatesFilter<"MovimentacaoFracionada"> | string
    tipo?: StringWithAggregatesFilter<"MovimentacaoFracionada"> | string
    quantidadeAnterior?: IntWithAggregatesFilter<"MovimentacaoFracionada"> | number
    quantidadeMovimentada?: IntWithAggregatesFilter<"MovimentacaoFracionada"> | number
    quantidadeResultante?: IntWithAggregatesFilter<"MovimentacaoFracionada"> | number
    codigoQrAnterior?: StringNullableWithAggregatesFilter<"MovimentacaoFracionada"> | string | null
    codigoQrNovo?: StringNullableWithAggregatesFilter<"MovimentacaoFracionada"> | string | null
    usuarioId?: StringWithAggregatesFilter<"MovimentacaoFracionada"> | string
    observacao?: StringNullableWithAggregatesFilter<"MovimentacaoFracionada"> | string | null
    criadoEm?: DateTimeWithAggregatesFilter<"MovimentacaoFracionada"> | Date | string
  }

  export type MedicamentoCreateInput = {
    id?: string
    catmatCodigo?: string | null
    nome: string
    principioAtivo?: string | null
    formaFarmaceutica?: string | null
    concentracao?: string | null
    unidadeMedida?: string
    quantidadePorEmbalagem?: number
    estoqueMinimo?: number
    criadoEm?: Date | string
    atualizadoEm?: Date | string
    deletedAt?: Date | string | null
    lotes?: LoteCreateNestedManyWithoutMedicamentoInput
    dispensacaoItens?: DispensacaoItemCreateNestedManyWithoutMedicamentoInput
    embalagensFracionadas?: EmbalageFracionadaCreateNestedManyWithoutMedicamentoInput
  }

  export type MedicamentoUncheckedCreateInput = {
    id?: string
    catmatCodigo?: string | null
    nome: string
    principioAtivo?: string | null
    formaFarmaceutica?: string | null
    concentracao?: string | null
    unidadeMedida?: string
    quantidadePorEmbalagem?: number
    estoqueMinimo?: number
    criadoEm?: Date | string
    atualizadoEm?: Date | string
    deletedAt?: Date | string | null
    lotes?: LoteUncheckedCreateNestedManyWithoutMedicamentoInput
    dispensacaoItens?: DispensacaoItemUncheckedCreateNestedManyWithoutMedicamentoInput
    embalagensFracionadas?: EmbalageFracionadaUncheckedCreateNestedManyWithoutMedicamentoInput
  }

  export type MedicamentoUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    catmatCodigo?: NullableStringFieldUpdateOperationsInput | string | null
    nome?: StringFieldUpdateOperationsInput | string
    principioAtivo?: NullableStringFieldUpdateOperationsInput | string | null
    formaFarmaceutica?: NullableStringFieldUpdateOperationsInput | string | null
    concentracao?: NullableStringFieldUpdateOperationsInput | string | null
    unidadeMedida?: StringFieldUpdateOperationsInput | string
    quantidadePorEmbalagem?: IntFieldUpdateOperationsInput | number
    estoqueMinimo?: IntFieldUpdateOperationsInput | number
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lotes?: LoteUpdateManyWithoutMedicamentoNestedInput
    dispensacaoItens?: DispensacaoItemUpdateManyWithoutMedicamentoNestedInput
    embalagensFracionadas?: EmbalageFracionadaUpdateManyWithoutMedicamentoNestedInput
  }

  export type MedicamentoUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    catmatCodigo?: NullableStringFieldUpdateOperationsInput | string | null
    nome?: StringFieldUpdateOperationsInput | string
    principioAtivo?: NullableStringFieldUpdateOperationsInput | string | null
    formaFarmaceutica?: NullableStringFieldUpdateOperationsInput | string | null
    concentracao?: NullableStringFieldUpdateOperationsInput | string | null
    unidadeMedida?: StringFieldUpdateOperationsInput | string
    quantidadePorEmbalagem?: IntFieldUpdateOperationsInput | number
    estoqueMinimo?: IntFieldUpdateOperationsInput | number
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lotes?: LoteUncheckedUpdateManyWithoutMedicamentoNestedInput
    dispensacaoItens?: DispensacaoItemUncheckedUpdateManyWithoutMedicamentoNestedInput
    embalagensFracionadas?: EmbalageFracionadaUncheckedUpdateManyWithoutMedicamentoNestedInput
  }

  export type MedicamentoCreateManyInput = {
    id?: string
    catmatCodigo?: string | null
    nome: string
    principioAtivo?: string | null
    formaFarmaceutica?: string | null
    concentracao?: string | null
    unidadeMedida?: string
    quantidadePorEmbalagem?: number
    estoqueMinimo?: number
    criadoEm?: Date | string
    atualizadoEm?: Date | string
    deletedAt?: Date | string | null
  }

  export type MedicamentoUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    catmatCodigo?: NullableStringFieldUpdateOperationsInput | string | null
    nome?: StringFieldUpdateOperationsInput | string
    principioAtivo?: NullableStringFieldUpdateOperationsInput | string | null
    formaFarmaceutica?: NullableStringFieldUpdateOperationsInput | string | null
    concentracao?: NullableStringFieldUpdateOperationsInput | string | null
    unidadeMedida?: StringFieldUpdateOperationsInput | string
    quantidadePorEmbalagem?: IntFieldUpdateOperationsInput | number
    estoqueMinimo?: IntFieldUpdateOperationsInput | number
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type MedicamentoUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    catmatCodigo?: NullableStringFieldUpdateOperationsInput | string | null
    nome?: StringFieldUpdateOperationsInput | string
    principioAtivo?: NullableStringFieldUpdateOperationsInput | string | null
    formaFarmaceutica?: NullableStringFieldUpdateOperationsInput | string | null
    concentracao?: NullableStringFieldUpdateOperationsInput | string | null
    unidadeMedida?: StringFieldUpdateOperationsInput | string
    quantidadePorEmbalagem?: IntFieldUpdateOperationsInput | number
    estoqueMinimo?: IntFieldUpdateOperationsInput | number
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type LoteCreateInput = {
    id?: string
    numeroLote: string
    quantidade: number
    quantidadeAtual: number
    quantidadeCaixasFechadas?: number
    quantidadePorCaixa?: number
    validade: Date | string
    fornecedor?: string | null
    notaFiscal?: string | null
    criadoEm?: Date | string
    deletedAt?: Date | string | null
    medicamento: MedicamentoCreateNestedOneWithoutLotesInput
    dispensacaoItens?: DispensacaoItemCreateNestedManyWithoutLoteInput
    embalagensFracionadas?: EmbalageFracionadaCreateNestedManyWithoutLoteInput
  }

  export type LoteUncheckedCreateInput = {
    id?: string
    medicamentoId: string
    numeroLote: string
    quantidade: number
    quantidadeAtual: number
    quantidadeCaixasFechadas?: number
    quantidadePorCaixa?: number
    validade: Date | string
    fornecedor?: string | null
    notaFiscal?: string | null
    criadoEm?: Date | string
    deletedAt?: Date | string | null
    dispensacaoItens?: DispensacaoItemUncheckedCreateNestedManyWithoutLoteInput
    embalagensFracionadas?: EmbalageFracionadaUncheckedCreateNestedManyWithoutLoteInput
  }

  export type LoteUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    numeroLote?: StringFieldUpdateOperationsInput | string
    quantidade?: IntFieldUpdateOperationsInput | number
    quantidadeAtual?: IntFieldUpdateOperationsInput | number
    quantidadeCaixasFechadas?: IntFieldUpdateOperationsInput | number
    quantidadePorCaixa?: IntFieldUpdateOperationsInput | number
    validade?: DateTimeFieldUpdateOperationsInput | Date | string
    fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    notaFiscal?: NullableStringFieldUpdateOperationsInput | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    medicamento?: MedicamentoUpdateOneRequiredWithoutLotesNestedInput
    dispensacaoItens?: DispensacaoItemUpdateManyWithoutLoteNestedInput
    embalagensFracionadas?: EmbalageFracionadaUpdateManyWithoutLoteNestedInput
  }

  export type LoteUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    medicamentoId?: StringFieldUpdateOperationsInput | string
    numeroLote?: StringFieldUpdateOperationsInput | string
    quantidade?: IntFieldUpdateOperationsInput | number
    quantidadeAtual?: IntFieldUpdateOperationsInput | number
    quantidadeCaixasFechadas?: IntFieldUpdateOperationsInput | number
    quantidadePorCaixa?: IntFieldUpdateOperationsInput | number
    validade?: DateTimeFieldUpdateOperationsInput | Date | string
    fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    notaFiscal?: NullableStringFieldUpdateOperationsInput | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    dispensacaoItens?: DispensacaoItemUncheckedUpdateManyWithoutLoteNestedInput
    embalagensFracionadas?: EmbalageFracionadaUncheckedUpdateManyWithoutLoteNestedInput
  }

  export type LoteCreateManyInput = {
    id?: string
    medicamentoId: string
    numeroLote: string
    quantidade: number
    quantidadeAtual: number
    quantidadeCaixasFechadas?: number
    quantidadePorCaixa?: number
    validade: Date | string
    fornecedor?: string | null
    notaFiscal?: string | null
    criadoEm?: Date | string
    deletedAt?: Date | string | null
  }

  export type LoteUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    numeroLote?: StringFieldUpdateOperationsInput | string
    quantidade?: IntFieldUpdateOperationsInput | number
    quantidadeAtual?: IntFieldUpdateOperationsInput | number
    quantidadeCaixasFechadas?: IntFieldUpdateOperationsInput | number
    quantidadePorCaixa?: IntFieldUpdateOperationsInput | number
    validade?: DateTimeFieldUpdateOperationsInput | Date | string
    fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    notaFiscal?: NullableStringFieldUpdateOperationsInput | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type LoteUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    medicamentoId?: StringFieldUpdateOperationsInput | string
    numeroLote?: StringFieldUpdateOperationsInput | string
    quantidade?: IntFieldUpdateOperationsInput | number
    quantidadeAtual?: IntFieldUpdateOperationsInput | number
    quantidadeCaixasFechadas?: IntFieldUpdateOperationsInput | number
    quantidadePorCaixa?: IntFieldUpdateOperationsInput | number
    validade?: DateTimeFieldUpdateOperationsInput | Date | string
    fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    notaFiscal?: NullableStringFieldUpdateOperationsInput | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type PacienteCreateInput = {
    id?: string
    nome: string
    cpf?: string | null
    cartaoSus?: string | null
    dataNasc?: Date | string | null
    telefone?: string | null
    endereco?: string | null
    criadoEm?: Date | string
    atualizadoEm?: Date | string
    deletedAt?: Date | string | null
    prescricoes?: PrescricaoCreateNestedManyWithoutPacienteInput
    dispensacoes?: DispensacaoCreateNestedManyWithoutPacienteInput
  }

  export type PacienteUncheckedCreateInput = {
    id?: string
    nome: string
    cpf?: string | null
    cartaoSus?: string | null
    dataNasc?: Date | string | null
    telefone?: string | null
    endereco?: string | null
    criadoEm?: Date | string
    atualizadoEm?: Date | string
    deletedAt?: Date | string | null
    prescricoes?: PrescricaoUncheckedCreateNestedManyWithoutPacienteInput
    dispensacoes?: DispensacaoUncheckedCreateNestedManyWithoutPacienteInput
  }

  export type PacienteUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    cpf?: NullableStringFieldUpdateOperationsInput | string | null
    cartaoSus?: NullableStringFieldUpdateOperationsInput | string | null
    dataNasc?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    telefone?: NullableStringFieldUpdateOperationsInput | string | null
    endereco?: NullableStringFieldUpdateOperationsInput | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    prescricoes?: PrescricaoUpdateManyWithoutPacienteNestedInput
    dispensacoes?: DispensacaoUpdateManyWithoutPacienteNestedInput
  }

  export type PacienteUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    cpf?: NullableStringFieldUpdateOperationsInput | string | null
    cartaoSus?: NullableStringFieldUpdateOperationsInput | string | null
    dataNasc?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    telefone?: NullableStringFieldUpdateOperationsInput | string | null
    endereco?: NullableStringFieldUpdateOperationsInput | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    prescricoes?: PrescricaoUncheckedUpdateManyWithoutPacienteNestedInput
    dispensacoes?: DispensacaoUncheckedUpdateManyWithoutPacienteNestedInput
  }

  export type PacienteCreateManyInput = {
    id?: string
    nome: string
    cpf?: string | null
    cartaoSus?: string | null
    dataNasc?: Date | string | null
    telefone?: string | null
    endereco?: string | null
    criadoEm?: Date | string
    atualizadoEm?: Date | string
    deletedAt?: Date | string | null
  }

  export type PacienteUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    cpf?: NullableStringFieldUpdateOperationsInput | string | null
    cartaoSus?: NullableStringFieldUpdateOperationsInput | string | null
    dataNasc?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    telefone?: NullableStringFieldUpdateOperationsInput | string | null
    endereco?: NullableStringFieldUpdateOperationsInput | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type PacienteUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    cpf?: NullableStringFieldUpdateOperationsInput | string | null
    cartaoSus?: NullableStringFieldUpdateOperationsInput | string | null
    dataNasc?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    telefone?: NullableStringFieldUpdateOperationsInput | string | null
    endereco?: NullableStringFieldUpdateOperationsInput | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type PrescricaoCreateInput = {
    id?: string
    medicoNome?: string | null
    crm?: string | null
    dataEmissao: Date | string
    dataValidade?: Date | string | null
    numeroReceita?: string | null
    arquivoUrl?: string | null
    observacoes?: string | null
    criadoEm?: Date | string
    deletedAt?: Date | string | null
    paciente: PacienteCreateNestedOneWithoutPrescricoesInput
    dispensacoes?: DispensacaoCreateNestedManyWithoutPrescricaoInput
  }

  export type PrescricaoUncheckedCreateInput = {
    id?: string
    pacienteId: string
    medicoNome?: string | null
    crm?: string | null
    dataEmissao: Date | string
    dataValidade?: Date | string | null
    numeroReceita?: string | null
    arquivoUrl?: string | null
    observacoes?: string | null
    criadoEm?: Date | string
    deletedAt?: Date | string | null
    dispensacoes?: DispensacaoUncheckedCreateNestedManyWithoutPrescricaoInput
  }

  export type PrescricaoUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    medicoNome?: NullableStringFieldUpdateOperationsInput | string | null
    crm?: NullableStringFieldUpdateOperationsInput | string | null
    dataEmissao?: DateTimeFieldUpdateOperationsInput | Date | string
    dataValidade?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    numeroReceita?: NullableStringFieldUpdateOperationsInput | string | null
    arquivoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    observacoes?: NullableStringFieldUpdateOperationsInput | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    paciente?: PacienteUpdateOneRequiredWithoutPrescricoesNestedInput
    dispensacoes?: DispensacaoUpdateManyWithoutPrescricaoNestedInput
  }

  export type PrescricaoUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    pacienteId?: StringFieldUpdateOperationsInput | string
    medicoNome?: NullableStringFieldUpdateOperationsInput | string | null
    crm?: NullableStringFieldUpdateOperationsInput | string | null
    dataEmissao?: DateTimeFieldUpdateOperationsInput | Date | string
    dataValidade?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    numeroReceita?: NullableStringFieldUpdateOperationsInput | string | null
    arquivoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    observacoes?: NullableStringFieldUpdateOperationsInput | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    dispensacoes?: DispensacaoUncheckedUpdateManyWithoutPrescricaoNestedInput
  }

  export type PrescricaoCreateManyInput = {
    id?: string
    pacienteId: string
    medicoNome?: string | null
    crm?: string | null
    dataEmissao: Date | string
    dataValidade?: Date | string | null
    numeroReceita?: string | null
    arquivoUrl?: string | null
    observacoes?: string | null
    criadoEm?: Date | string
    deletedAt?: Date | string | null
  }

  export type PrescricaoUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    medicoNome?: NullableStringFieldUpdateOperationsInput | string | null
    crm?: NullableStringFieldUpdateOperationsInput | string | null
    dataEmissao?: DateTimeFieldUpdateOperationsInput | Date | string
    dataValidade?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    numeroReceita?: NullableStringFieldUpdateOperationsInput | string | null
    arquivoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    observacoes?: NullableStringFieldUpdateOperationsInput | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type PrescricaoUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    pacienteId?: StringFieldUpdateOperationsInput | string
    medicoNome?: NullableStringFieldUpdateOperationsInput | string | null
    crm?: NullableStringFieldUpdateOperationsInput | string | null
    dataEmissao?: DateTimeFieldUpdateOperationsInput | Date | string
    dataValidade?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    numeroReceita?: NullableStringFieldUpdateOperationsInput | string | null
    arquivoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    observacoes?: NullableStringFieldUpdateOperationsInput | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type DispensacaoCreateInput = {
    id?: string
    usuarioId: string
    dataDispensacao?: Date | string
    observacoes?: string | null
    criadoEm?: Date | string
    paciente: PacienteCreateNestedOneWithoutDispensacoesInput
    prescricao?: PrescricaoCreateNestedOneWithoutDispensacoesInput
    itens?: DispensacaoItemCreateNestedManyWithoutDispensacaoInput
  }

  export type DispensacaoUncheckedCreateInput = {
    id?: string
    pacienteId: string
    prescricaoId?: string | null
    usuarioId: string
    dataDispensacao?: Date | string
    observacoes?: string | null
    criadoEm?: Date | string
    itens?: DispensacaoItemUncheckedCreateNestedManyWithoutDispensacaoInput
  }

  export type DispensacaoUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    usuarioId?: StringFieldUpdateOperationsInput | string
    dataDispensacao?: DateTimeFieldUpdateOperationsInput | Date | string
    observacoes?: NullableStringFieldUpdateOperationsInput | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    paciente?: PacienteUpdateOneRequiredWithoutDispensacoesNestedInput
    prescricao?: PrescricaoUpdateOneWithoutDispensacoesNestedInput
    itens?: DispensacaoItemUpdateManyWithoutDispensacaoNestedInput
  }

  export type DispensacaoUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    pacienteId?: StringFieldUpdateOperationsInput | string
    prescricaoId?: NullableStringFieldUpdateOperationsInput | string | null
    usuarioId?: StringFieldUpdateOperationsInput | string
    dataDispensacao?: DateTimeFieldUpdateOperationsInput | Date | string
    observacoes?: NullableStringFieldUpdateOperationsInput | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    itens?: DispensacaoItemUncheckedUpdateManyWithoutDispensacaoNestedInput
  }

  export type DispensacaoCreateManyInput = {
    id?: string
    pacienteId: string
    prescricaoId?: string | null
    usuarioId: string
    dataDispensacao?: Date | string
    observacoes?: string | null
    criadoEm?: Date | string
  }

  export type DispensacaoUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    usuarioId?: StringFieldUpdateOperationsInput | string
    dataDispensacao?: DateTimeFieldUpdateOperationsInput | Date | string
    observacoes?: NullableStringFieldUpdateOperationsInput | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DispensacaoUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    pacienteId?: StringFieldUpdateOperationsInput | string
    prescricaoId?: NullableStringFieldUpdateOperationsInput | string | null
    usuarioId?: StringFieldUpdateOperationsInput | string
    dataDispensacao?: DateTimeFieldUpdateOperationsInput | Date | string
    observacoes?: NullableStringFieldUpdateOperationsInput | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DispensacaoItemCreateInput = {
    id?: string
    quantidade: number
    criadoEm?: Date | string
    dispensacao: DispensacaoCreateNestedOneWithoutItensInput
    medicamento: MedicamentoCreateNestedOneWithoutDispensacaoItensInput
    lote?: LoteCreateNestedOneWithoutDispensacaoItensInput
    embalagem?: EmbalageFracionadaCreateNestedOneWithoutDispensacaoItensInput
  }

  export type DispensacaoItemUncheckedCreateInput = {
    id?: string
    dispensacaoId: string
    medicamentoId: string
    loteId?: string | null
    embalagemFracionadaId?: string | null
    quantidade: number
    criadoEm?: Date | string
  }

  export type DispensacaoItemUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    quantidade?: IntFieldUpdateOperationsInput | number
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    dispensacao?: DispensacaoUpdateOneRequiredWithoutItensNestedInput
    medicamento?: MedicamentoUpdateOneRequiredWithoutDispensacaoItensNestedInput
    lote?: LoteUpdateOneWithoutDispensacaoItensNestedInput
    embalagem?: EmbalageFracionadaUpdateOneWithoutDispensacaoItensNestedInput
  }

  export type DispensacaoItemUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    dispensacaoId?: StringFieldUpdateOperationsInput | string
    medicamentoId?: StringFieldUpdateOperationsInput | string
    loteId?: NullableStringFieldUpdateOperationsInput | string | null
    embalagemFracionadaId?: NullableStringFieldUpdateOperationsInput | string | null
    quantidade?: IntFieldUpdateOperationsInput | number
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DispensacaoItemCreateManyInput = {
    id?: string
    dispensacaoId: string
    medicamentoId: string
    loteId?: string | null
    embalagemFracionadaId?: string | null
    quantidade: number
    criadoEm?: Date | string
  }

  export type DispensacaoItemUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    quantidade?: IntFieldUpdateOperationsInput | number
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DispensacaoItemUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    dispensacaoId?: StringFieldUpdateOperationsInput | string
    medicamentoId?: StringFieldUpdateOperationsInput | string
    loteId?: NullableStringFieldUpdateOperationsInput | string | null
    embalagemFracionadaId?: NullableStringFieldUpdateOperationsInput | string | null
    quantidade?: IntFieldUpdateOperationsInput | number
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EmbalageFracionadaCreateInput = {
    id?: string
    codigoQr: string
    quantidadeAtual: number
    status?: string
    criadoEm?: Date | string
    atualizadoEm?: Date | string
    criadoPor: string
    lote: LoteCreateNestedOneWithoutEmbalagensFracionadasInput
    medicamento: MedicamentoCreateNestedOneWithoutEmbalagensFracionadasInput
    dispensacaoItens?: DispensacaoItemCreateNestedManyWithoutEmbalagemInput
    movimentacoes?: MovimentacaoFracionadaCreateNestedManyWithoutEmbalagemInput
  }

  export type EmbalageFracionadaUncheckedCreateInput = {
    id?: string
    loteId: string
    medicamentoId: string
    codigoQr: string
    quantidadeAtual: number
    status?: string
    criadoEm?: Date | string
    atualizadoEm?: Date | string
    criadoPor: string
    dispensacaoItens?: DispensacaoItemUncheckedCreateNestedManyWithoutEmbalagemInput
    movimentacoes?: MovimentacaoFracionadaUncheckedCreateNestedManyWithoutEmbalagemInput
  }

  export type EmbalageFracionadaUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    codigoQr?: StringFieldUpdateOperationsInput | string
    quantidadeAtual?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    criadoPor?: StringFieldUpdateOperationsInput | string
    lote?: LoteUpdateOneRequiredWithoutEmbalagensFracionadasNestedInput
    medicamento?: MedicamentoUpdateOneRequiredWithoutEmbalagensFracionadasNestedInput
    dispensacaoItens?: DispensacaoItemUpdateManyWithoutEmbalagemNestedInput
    movimentacoes?: MovimentacaoFracionadaUpdateManyWithoutEmbalagemNestedInput
  }

  export type EmbalageFracionadaUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    loteId?: StringFieldUpdateOperationsInput | string
    medicamentoId?: StringFieldUpdateOperationsInput | string
    codigoQr?: StringFieldUpdateOperationsInput | string
    quantidadeAtual?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    criadoPor?: StringFieldUpdateOperationsInput | string
    dispensacaoItens?: DispensacaoItemUncheckedUpdateManyWithoutEmbalagemNestedInput
    movimentacoes?: MovimentacaoFracionadaUncheckedUpdateManyWithoutEmbalagemNestedInput
  }

  export type EmbalageFracionadaCreateManyInput = {
    id?: string
    loteId: string
    medicamentoId: string
    codigoQr: string
    quantidadeAtual: number
    status?: string
    criadoEm?: Date | string
    atualizadoEm?: Date | string
    criadoPor: string
  }

  export type EmbalageFracionadaUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    codigoQr?: StringFieldUpdateOperationsInput | string
    quantidadeAtual?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    criadoPor?: StringFieldUpdateOperationsInput | string
  }

  export type EmbalageFracionadaUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    loteId?: StringFieldUpdateOperationsInput | string
    medicamentoId?: StringFieldUpdateOperationsInput | string
    codigoQr?: StringFieldUpdateOperationsInput | string
    quantidadeAtual?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    criadoPor?: StringFieldUpdateOperationsInput | string
  }

  export type MovimentacaoFracionadaCreateInput = {
    id?: string
    tipo: string
    quantidadeAnterior: number
    quantidadeMovimentada: number
    quantidadeResultante: number
    codigoQrAnterior?: string | null
    codigoQrNovo?: string | null
    usuarioId: string
    observacao?: string | null
    criadoEm?: Date | string
    embalagem: EmbalageFracionadaCreateNestedOneWithoutMovimentacoesInput
  }

  export type MovimentacaoFracionadaUncheckedCreateInput = {
    id?: string
    embalagemFracionadaId: string
    tipo: string
    quantidadeAnterior: number
    quantidadeMovimentada: number
    quantidadeResultante: number
    codigoQrAnterior?: string | null
    codigoQrNovo?: string | null
    usuarioId: string
    observacao?: string | null
    criadoEm?: Date | string
  }

  export type MovimentacaoFracionadaUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    quantidadeAnterior?: IntFieldUpdateOperationsInput | number
    quantidadeMovimentada?: IntFieldUpdateOperationsInput | number
    quantidadeResultante?: IntFieldUpdateOperationsInput | number
    codigoQrAnterior?: NullableStringFieldUpdateOperationsInput | string | null
    codigoQrNovo?: NullableStringFieldUpdateOperationsInput | string | null
    usuarioId?: StringFieldUpdateOperationsInput | string
    observacao?: NullableStringFieldUpdateOperationsInput | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    embalagem?: EmbalageFracionadaUpdateOneRequiredWithoutMovimentacoesNestedInput
  }

  export type MovimentacaoFracionadaUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    embalagemFracionadaId?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    quantidadeAnterior?: IntFieldUpdateOperationsInput | number
    quantidadeMovimentada?: IntFieldUpdateOperationsInput | number
    quantidadeResultante?: IntFieldUpdateOperationsInput | number
    codigoQrAnterior?: NullableStringFieldUpdateOperationsInput | string | null
    codigoQrNovo?: NullableStringFieldUpdateOperationsInput | string | null
    usuarioId?: StringFieldUpdateOperationsInput | string
    observacao?: NullableStringFieldUpdateOperationsInput | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MovimentacaoFracionadaCreateManyInput = {
    id?: string
    embalagemFracionadaId: string
    tipo: string
    quantidadeAnterior: number
    quantidadeMovimentada: number
    quantidadeResultante: number
    codigoQrAnterior?: string | null
    codigoQrNovo?: string | null
    usuarioId: string
    observacao?: string | null
    criadoEm?: Date | string
  }

  export type MovimentacaoFracionadaUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    quantidadeAnterior?: IntFieldUpdateOperationsInput | number
    quantidadeMovimentada?: IntFieldUpdateOperationsInput | number
    quantidadeResultante?: IntFieldUpdateOperationsInput | number
    codigoQrAnterior?: NullableStringFieldUpdateOperationsInput | string | null
    codigoQrNovo?: NullableStringFieldUpdateOperationsInput | string | null
    usuarioId?: StringFieldUpdateOperationsInput | string
    observacao?: NullableStringFieldUpdateOperationsInput | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MovimentacaoFracionadaUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    embalagemFracionadaId?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    quantidadeAnterior?: IntFieldUpdateOperationsInput | number
    quantidadeMovimentada?: IntFieldUpdateOperationsInput | number
    quantidadeResultante?: IntFieldUpdateOperationsInput | number
    codigoQrAnterior?: NullableStringFieldUpdateOperationsInput | string | null
    codigoQrNovo?: NullableStringFieldUpdateOperationsInput | string | null
    usuarioId?: StringFieldUpdateOperationsInput | string
    observacao?: NullableStringFieldUpdateOperationsInput | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type LoteListRelationFilter = {
    every?: LoteWhereInput
    some?: LoteWhereInput
    none?: LoteWhereInput
  }

  export type DispensacaoItemListRelationFilter = {
    every?: DispensacaoItemWhereInput
    some?: DispensacaoItemWhereInput
    none?: DispensacaoItemWhereInput
  }

  export type EmbalageFracionadaListRelationFilter = {
    every?: EmbalageFracionadaWhereInput
    some?: EmbalageFracionadaWhereInput
    none?: EmbalageFracionadaWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type LoteOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type DispensacaoItemOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type EmbalageFracionadaOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type MedicamentoCountOrderByAggregateInput = {
    id?: SortOrder
    catmatCodigo?: SortOrder
    nome?: SortOrder
    principioAtivo?: SortOrder
    formaFarmaceutica?: SortOrder
    concentracao?: SortOrder
    unidadeMedida?: SortOrder
    quantidadePorEmbalagem?: SortOrder
    estoqueMinimo?: SortOrder
    criadoEm?: SortOrder
    atualizadoEm?: SortOrder
    deletedAt?: SortOrder
  }

  export type MedicamentoAvgOrderByAggregateInput = {
    quantidadePorEmbalagem?: SortOrder
    estoqueMinimo?: SortOrder
  }

  export type MedicamentoMaxOrderByAggregateInput = {
    id?: SortOrder
    catmatCodigo?: SortOrder
    nome?: SortOrder
    principioAtivo?: SortOrder
    formaFarmaceutica?: SortOrder
    concentracao?: SortOrder
    unidadeMedida?: SortOrder
    quantidadePorEmbalagem?: SortOrder
    estoqueMinimo?: SortOrder
    criadoEm?: SortOrder
    atualizadoEm?: SortOrder
    deletedAt?: SortOrder
  }

  export type MedicamentoMinOrderByAggregateInput = {
    id?: SortOrder
    catmatCodigo?: SortOrder
    nome?: SortOrder
    principioAtivo?: SortOrder
    formaFarmaceutica?: SortOrder
    concentracao?: SortOrder
    unidadeMedida?: SortOrder
    quantidadePorEmbalagem?: SortOrder
    estoqueMinimo?: SortOrder
    criadoEm?: SortOrder
    atualizadoEm?: SortOrder
    deletedAt?: SortOrder
  }

  export type MedicamentoSumOrderByAggregateInput = {
    quantidadePorEmbalagem?: SortOrder
    estoqueMinimo?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type MedicamentoScalarRelationFilter = {
    is?: MedicamentoWhereInput
    isNot?: MedicamentoWhereInput
  }

  export type LoteCountOrderByAggregateInput = {
    id?: SortOrder
    medicamentoId?: SortOrder
    numeroLote?: SortOrder
    quantidade?: SortOrder
    quantidadeAtual?: SortOrder
    quantidadeCaixasFechadas?: SortOrder
    quantidadePorCaixa?: SortOrder
    validade?: SortOrder
    fornecedor?: SortOrder
    notaFiscal?: SortOrder
    criadoEm?: SortOrder
    deletedAt?: SortOrder
  }

  export type LoteAvgOrderByAggregateInput = {
    quantidade?: SortOrder
    quantidadeAtual?: SortOrder
    quantidadeCaixasFechadas?: SortOrder
    quantidadePorCaixa?: SortOrder
  }

  export type LoteMaxOrderByAggregateInput = {
    id?: SortOrder
    medicamentoId?: SortOrder
    numeroLote?: SortOrder
    quantidade?: SortOrder
    quantidadeAtual?: SortOrder
    quantidadeCaixasFechadas?: SortOrder
    quantidadePorCaixa?: SortOrder
    validade?: SortOrder
    fornecedor?: SortOrder
    notaFiscal?: SortOrder
    criadoEm?: SortOrder
    deletedAt?: SortOrder
  }

  export type LoteMinOrderByAggregateInput = {
    id?: SortOrder
    medicamentoId?: SortOrder
    numeroLote?: SortOrder
    quantidade?: SortOrder
    quantidadeAtual?: SortOrder
    quantidadeCaixasFechadas?: SortOrder
    quantidadePorCaixa?: SortOrder
    validade?: SortOrder
    fornecedor?: SortOrder
    notaFiscal?: SortOrder
    criadoEm?: SortOrder
    deletedAt?: SortOrder
  }

  export type LoteSumOrderByAggregateInput = {
    quantidade?: SortOrder
    quantidadeAtual?: SortOrder
    quantidadeCaixasFechadas?: SortOrder
    quantidadePorCaixa?: SortOrder
  }

  export type PrescricaoListRelationFilter = {
    every?: PrescricaoWhereInput
    some?: PrescricaoWhereInput
    none?: PrescricaoWhereInput
  }

  export type DispensacaoListRelationFilter = {
    every?: DispensacaoWhereInput
    some?: DispensacaoWhereInput
    none?: DispensacaoWhereInput
  }

  export type PrescricaoOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type DispensacaoOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type PacienteCountOrderByAggregateInput = {
    id?: SortOrder
    nome?: SortOrder
    cpf?: SortOrder
    cartaoSus?: SortOrder
    dataNasc?: SortOrder
    telefone?: SortOrder
    endereco?: SortOrder
    criadoEm?: SortOrder
    atualizadoEm?: SortOrder
    deletedAt?: SortOrder
  }

  export type PacienteMaxOrderByAggregateInput = {
    id?: SortOrder
    nome?: SortOrder
    cpf?: SortOrder
    cartaoSus?: SortOrder
    dataNasc?: SortOrder
    telefone?: SortOrder
    endereco?: SortOrder
    criadoEm?: SortOrder
    atualizadoEm?: SortOrder
    deletedAt?: SortOrder
  }

  export type PacienteMinOrderByAggregateInput = {
    id?: SortOrder
    nome?: SortOrder
    cpf?: SortOrder
    cartaoSus?: SortOrder
    dataNasc?: SortOrder
    telefone?: SortOrder
    endereco?: SortOrder
    criadoEm?: SortOrder
    atualizadoEm?: SortOrder
    deletedAt?: SortOrder
  }

  export type PacienteScalarRelationFilter = {
    is?: PacienteWhereInput
    isNot?: PacienteWhereInput
  }

  export type PrescricaoCountOrderByAggregateInput = {
    id?: SortOrder
    pacienteId?: SortOrder
    medicoNome?: SortOrder
    crm?: SortOrder
    dataEmissao?: SortOrder
    dataValidade?: SortOrder
    numeroReceita?: SortOrder
    arquivoUrl?: SortOrder
    observacoes?: SortOrder
    criadoEm?: SortOrder
    deletedAt?: SortOrder
  }

  export type PrescricaoMaxOrderByAggregateInput = {
    id?: SortOrder
    pacienteId?: SortOrder
    medicoNome?: SortOrder
    crm?: SortOrder
    dataEmissao?: SortOrder
    dataValidade?: SortOrder
    numeroReceita?: SortOrder
    arquivoUrl?: SortOrder
    observacoes?: SortOrder
    criadoEm?: SortOrder
    deletedAt?: SortOrder
  }

  export type PrescricaoMinOrderByAggregateInput = {
    id?: SortOrder
    pacienteId?: SortOrder
    medicoNome?: SortOrder
    crm?: SortOrder
    dataEmissao?: SortOrder
    dataValidade?: SortOrder
    numeroReceita?: SortOrder
    arquivoUrl?: SortOrder
    observacoes?: SortOrder
    criadoEm?: SortOrder
    deletedAt?: SortOrder
  }

  export type PrescricaoNullableScalarRelationFilter = {
    is?: PrescricaoWhereInput | null
    isNot?: PrescricaoWhereInput | null
  }

  export type DispensacaoCountOrderByAggregateInput = {
    id?: SortOrder
    pacienteId?: SortOrder
    prescricaoId?: SortOrder
    usuarioId?: SortOrder
    dataDispensacao?: SortOrder
    observacoes?: SortOrder
    criadoEm?: SortOrder
  }

  export type DispensacaoMaxOrderByAggregateInput = {
    id?: SortOrder
    pacienteId?: SortOrder
    prescricaoId?: SortOrder
    usuarioId?: SortOrder
    dataDispensacao?: SortOrder
    observacoes?: SortOrder
    criadoEm?: SortOrder
  }

  export type DispensacaoMinOrderByAggregateInput = {
    id?: SortOrder
    pacienteId?: SortOrder
    prescricaoId?: SortOrder
    usuarioId?: SortOrder
    dataDispensacao?: SortOrder
    observacoes?: SortOrder
    criadoEm?: SortOrder
  }

  export type DispensacaoScalarRelationFilter = {
    is?: DispensacaoWhereInput
    isNot?: DispensacaoWhereInput
  }

  export type LoteNullableScalarRelationFilter = {
    is?: LoteWhereInput | null
    isNot?: LoteWhereInput | null
  }

  export type EmbalageFracionadaNullableScalarRelationFilter = {
    is?: EmbalageFracionadaWhereInput | null
    isNot?: EmbalageFracionadaWhereInput | null
  }

  export type DispensacaoItemCountOrderByAggregateInput = {
    id?: SortOrder
    dispensacaoId?: SortOrder
    medicamentoId?: SortOrder
    loteId?: SortOrder
    embalagemFracionadaId?: SortOrder
    quantidade?: SortOrder
    criadoEm?: SortOrder
  }

  export type DispensacaoItemAvgOrderByAggregateInput = {
    quantidade?: SortOrder
  }

  export type DispensacaoItemMaxOrderByAggregateInput = {
    id?: SortOrder
    dispensacaoId?: SortOrder
    medicamentoId?: SortOrder
    loteId?: SortOrder
    embalagemFracionadaId?: SortOrder
    quantidade?: SortOrder
    criadoEm?: SortOrder
  }

  export type DispensacaoItemMinOrderByAggregateInput = {
    id?: SortOrder
    dispensacaoId?: SortOrder
    medicamentoId?: SortOrder
    loteId?: SortOrder
    embalagemFracionadaId?: SortOrder
    quantidade?: SortOrder
    criadoEm?: SortOrder
  }

  export type DispensacaoItemSumOrderByAggregateInput = {
    quantidade?: SortOrder
  }

  export type LoteScalarRelationFilter = {
    is?: LoteWhereInput
    isNot?: LoteWhereInput
  }

  export type MovimentacaoFracionadaListRelationFilter = {
    every?: MovimentacaoFracionadaWhereInput
    some?: MovimentacaoFracionadaWhereInput
    none?: MovimentacaoFracionadaWhereInput
  }

  export type MovimentacaoFracionadaOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type EmbalageFracionadaCountOrderByAggregateInput = {
    id?: SortOrder
    loteId?: SortOrder
    medicamentoId?: SortOrder
    codigoQr?: SortOrder
    quantidadeAtual?: SortOrder
    status?: SortOrder
    criadoEm?: SortOrder
    atualizadoEm?: SortOrder
    criadoPor?: SortOrder
  }

  export type EmbalageFracionadaAvgOrderByAggregateInput = {
    quantidadeAtual?: SortOrder
  }

  export type EmbalageFracionadaMaxOrderByAggregateInput = {
    id?: SortOrder
    loteId?: SortOrder
    medicamentoId?: SortOrder
    codigoQr?: SortOrder
    quantidadeAtual?: SortOrder
    status?: SortOrder
    criadoEm?: SortOrder
    atualizadoEm?: SortOrder
    criadoPor?: SortOrder
  }

  export type EmbalageFracionadaMinOrderByAggregateInput = {
    id?: SortOrder
    loteId?: SortOrder
    medicamentoId?: SortOrder
    codigoQr?: SortOrder
    quantidadeAtual?: SortOrder
    status?: SortOrder
    criadoEm?: SortOrder
    atualizadoEm?: SortOrder
    criadoPor?: SortOrder
  }

  export type EmbalageFracionadaSumOrderByAggregateInput = {
    quantidadeAtual?: SortOrder
  }

  export type EmbalageFracionadaScalarRelationFilter = {
    is?: EmbalageFracionadaWhereInput
    isNot?: EmbalageFracionadaWhereInput
  }

  export type MovimentacaoFracionadaCountOrderByAggregateInput = {
    id?: SortOrder
    embalagemFracionadaId?: SortOrder
    tipo?: SortOrder
    quantidadeAnterior?: SortOrder
    quantidadeMovimentada?: SortOrder
    quantidadeResultante?: SortOrder
    codigoQrAnterior?: SortOrder
    codigoQrNovo?: SortOrder
    usuarioId?: SortOrder
    observacao?: SortOrder
    criadoEm?: SortOrder
  }

  export type MovimentacaoFracionadaAvgOrderByAggregateInput = {
    quantidadeAnterior?: SortOrder
    quantidadeMovimentada?: SortOrder
    quantidadeResultante?: SortOrder
  }

  export type MovimentacaoFracionadaMaxOrderByAggregateInput = {
    id?: SortOrder
    embalagemFracionadaId?: SortOrder
    tipo?: SortOrder
    quantidadeAnterior?: SortOrder
    quantidadeMovimentada?: SortOrder
    quantidadeResultante?: SortOrder
    codigoQrAnterior?: SortOrder
    codigoQrNovo?: SortOrder
    usuarioId?: SortOrder
    observacao?: SortOrder
    criadoEm?: SortOrder
  }

  export type MovimentacaoFracionadaMinOrderByAggregateInput = {
    id?: SortOrder
    embalagemFracionadaId?: SortOrder
    tipo?: SortOrder
    quantidadeAnterior?: SortOrder
    quantidadeMovimentada?: SortOrder
    quantidadeResultante?: SortOrder
    codigoQrAnterior?: SortOrder
    codigoQrNovo?: SortOrder
    usuarioId?: SortOrder
    observacao?: SortOrder
    criadoEm?: SortOrder
  }

  export type MovimentacaoFracionadaSumOrderByAggregateInput = {
    quantidadeAnterior?: SortOrder
    quantidadeMovimentada?: SortOrder
    quantidadeResultante?: SortOrder
  }

  export type LoteCreateNestedManyWithoutMedicamentoInput = {
    create?: XOR<LoteCreateWithoutMedicamentoInput, LoteUncheckedCreateWithoutMedicamentoInput> | LoteCreateWithoutMedicamentoInput[] | LoteUncheckedCreateWithoutMedicamentoInput[]
    connectOrCreate?: LoteCreateOrConnectWithoutMedicamentoInput | LoteCreateOrConnectWithoutMedicamentoInput[]
    createMany?: LoteCreateManyMedicamentoInputEnvelope
    connect?: LoteWhereUniqueInput | LoteWhereUniqueInput[]
  }

  export type DispensacaoItemCreateNestedManyWithoutMedicamentoInput = {
    create?: XOR<DispensacaoItemCreateWithoutMedicamentoInput, DispensacaoItemUncheckedCreateWithoutMedicamentoInput> | DispensacaoItemCreateWithoutMedicamentoInput[] | DispensacaoItemUncheckedCreateWithoutMedicamentoInput[]
    connectOrCreate?: DispensacaoItemCreateOrConnectWithoutMedicamentoInput | DispensacaoItemCreateOrConnectWithoutMedicamentoInput[]
    createMany?: DispensacaoItemCreateManyMedicamentoInputEnvelope
    connect?: DispensacaoItemWhereUniqueInput | DispensacaoItemWhereUniqueInput[]
  }

  export type EmbalageFracionadaCreateNestedManyWithoutMedicamentoInput = {
    create?: XOR<EmbalageFracionadaCreateWithoutMedicamentoInput, EmbalageFracionadaUncheckedCreateWithoutMedicamentoInput> | EmbalageFracionadaCreateWithoutMedicamentoInput[] | EmbalageFracionadaUncheckedCreateWithoutMedicamentoInput[]
    connectOrCreate?: EmbalageFracionadaCreateOrConnectWithoutMedicamentoInput | EmbalageFracionadaCreateOrConnectWithoutMedicamentoInput[]
    createMany?: EmbalageFracionadaCreateManyMedicamentoInputEnvelope
    connect?: EmbalageFracionadaWhereUniqueInput | EmbalageFracionadaWhereUniqueInput[]
  }

  export type LoteUncheckedCreateNestedManyWithoutMedicamentoInput = {
    create?: XOR<LoteCreateWithoutMedicamentoInput, LoteUncheckedCreateWithoutMedicamentoInput> | LoteCreateWithoutMedicamentoInput[] | LoteUncheckedCreateWithoutMedicamentoInput[]
    connectOrCreate?: LoteCreateOrConnectWithoutMedicamentoInput | LoteCreateOrConnectWithoutMedicamentoInput[]
    createMany?: LoteCreateManyMedicamentoInputEnvelope
    connect?: LoteWhereUniqueInput | LoteWhereUniqueInput[]
  }

  export type DispensacaoItemUncheckedCreateNestedManyWithoutMedicamentoInput = {
    create?: XOR<DispensacaoItemCreateWithoutMedicamentoInput, DispensacaoItemUncheckedCreateWithoutMedicamentoInput> | DispensacaoItemCreateWithoutMedicamentoInput[] | DispensacaoItemUncheckedCreateWithoutMedicamentoInput[]
    connectOrCreate?: DispensacaoItemCreateOrConnectWithoutMedicamentoInput | DispensacaoItemCreateOrConnectWithoutMedicamentoInput[]
    createMany?: DispensacaoItemCreateManyMedicamentoInputEnvelope
    connect?: DispensacaoItemWhereUniqueInput | DispensacaoItemWhereUniqueInput[]
  }

  export type EmbalageFracionadaUncheckedCreateNestedManyWithoutMedicamentoInput = {
    create?: XOR<EmbalageFracionadaCreateWithoutMedicamentoInput, EmbalageFracionadaUncheckedCreateWithoutMedicamentoInput> | EmbalageFracionadaCreateWithoutMedicamentoInput[] | EmbalageFracionadaUncheckedCreateWithoutMedicamentoInput[]
    connectOrCreate?: EmbalageFracionadaCreateOrConnectWithoutMedicamentoInput | EmbalageFracionadaCreateOrConnectWithoutMedicamentoInput[]
    createMany?: EmbalageFracionadaCreateManyMedicamentoInputEnvelope
    connect?: EmbalageFracionadaWhereUniqueInput | EmbalageFracionadaWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type LoteUpdateManyWithoutMedicamentoNestedInput = {
    create?: XOR<LoteCreateWithoutMedicamentoInput, LoteUncheckedCreateWithoutMedicamentoInput> | LoteCreateWithoutMedicamentoInput[] | LoteUncheckedCreateWithoutMedicamentoInput[]
    connectOrCreate?: LoteCreateOrConnectWithoutMedicamentoInput | LoteCreateOrConnectWithoutMedicamentoInput[]
    upsert?: LoteUpsertWithWhereUniqueWithoutMedicamentoInput | LoteUpsertWithWhereUniqueWithoutMedicamentoInput[]
    createMany?: LoteCreateManyMedicamentoInputEnvelope
    set?: LoteWhereUniqueInput | LoteWhereUniqueInput[]
    disconnect?: LoteWhereUniqueInput | LoteWhereUniqueInput[]
    delete?: LoteWhereUniqueInput | LoteWhereUniqueInput[]
    connect?: LoteWhereUniqueInput | LoteWhereUniqueInput[]
    update?: LoteUpdateWithWhereUniqueWithoutMedicamentoInput | LoteUpdateWithWhereUniqueWithoutMedicamentoInput[]
    updateMany?: LoteUpdateManyWithWhereWithoutMedicamentoInput | LoteUpdateManyWithWhereWithoutMedicamentoInput[]
    deleteMany?: LoteScalarWhereInput | LoteScalarWhereInput[]
  }

  export type DispensacaoItemUpdateManyWithoutMedicamentoNestedInput = {
    create?: XOR<DispensacaoItemCreateWithoutMedicamentoInput, DispensacaoItemUncheckedCreateWithoutMedicamentoInput> | DispensacaoItemCreateWithoutMedicamentoInput[] | DispensacaoItemUncheckedCreateWithoutMedicamentoInput[]
    connectOrCreate?: DispensacaoItemCreateOrConnectWithoutMedicamentoInput | DispensacaoItemCreateOrConnectWithoutMedicamentoInput[]
    upsert?: DispensacaoItemUpsertWithWhereUniqueWithoutMedicamentoInput | DispensacaoItemUpsertWithWhereUniqueWithoutMedicamentoInput[]
    createMany?: DispensacaoItemCreateManyMedicamentoInputEnvelope
    set?: DispensacaoItemWhereUniqueInput | DispensacaoItemWhereUniqueInput[]
    disconnect?: DispensacaoItemWhereUniqueInput | DispensacaoItemWhereUniqueInput[]
    delete?: DispensacaoItemWhereUniqueInput | DispensacaoItemWhereUniqueInput[]
    connect?: DispensacaoItemWhereUniqueInput | DispensacaoItemWhereUniqueInput[]
    update?: DispensacaoItemUpdateWithWhereUniqueWithoutMedicamentoInput | DispensacaoItemUpdateWithWhereUniqueWithoutMedicamentoInput[]
    updateMany?: DispensacaoItemUpdateManyWithWhereWithoutMedicamentoInput | DispensacaoItemUpdateManyWithWhereWithoutMedicamentoInput[]
    deleteMany?: DispensacaoItemScalarWhereInput | DispensacaoItemScalarWhereInput[]
  }

  export type EmbalageFracionadaUpdateManyWithoutMedicamentoNestedInput = {
    create?: XOR<EmbalageFracionadaCreateWithoutMedicamentoInput, EmbalageFracionadaUncheckedCreateWithoutMedicamentoInput> | EmbalageFracionadaCreateWithoutMedicamentoInput[] | EmbalageFracionadaUncheckedCreateWithoutMedicamentoInput[]
    connectOrCreate?: EmbalageFracionadaCreateOrConnectWithoutMedicamentoInput | EmbalageFracionadaCreateOrConnectWithoutMedicamentoInput[]
    upsert?: EmbalageFracionadaUpsertWithWhereUniqueWithoutMedicamentoInput | EmbalageFracionadaUpsertWithWhereUniqueWithoutMedicamentoInput[]
    createMany?: EmbalageFracionadaCreateManyMedicamentoInputEnvelope
    set?: EmbalageFracionadaWhereUniqueInput | EmbalageFracionadaWhereUniqueInput[]
    disconnect?: EmbalageFracionadaWhereUniqueInput | EmbalageFracionadaWhereUniqueInput[]
    delete?: EmbalageFracionadaWhereUniqueInput | EmbalageFracionadaWhereUniqueInput[]
    connect?: EmbalageFracionadaWhereUniqueInput | EmbalageFracionadaWhereUniqueInput[]
    update?: EmbalageFracionadaUpdateWithWhereUniqueWithoutMedicamentoInput | EmbalageFracionadaUpdateWithWhereUniqueWithoutMedicamentoInput[]
    updateMany?: EmbalageFracionadaUpdateManyWithWhereWithoutMedicamentoInput | EmbalageFracionadaUpdateManyWithWhereWithoutMedicamentoInput[]
    deleteMany?: EmbalageFracionadaScalarWhereInput | EmbalageFracionadaScalarWhereInput[]
  }

  export type LoteUncheckedUpdateManyWithoutMedicamentoNestedInput = {
    create?: XOR<LoteCreateWithoutMedicamentoInput, LoteUncheckedCreateWithoutMedicamentoInput> | LoteCreateWithoutMedicamentoInput[] | LoteUncheckedCreateWithoutMedicamentoInput[]
    connectOrCreate?: LoteCreateOrConnectWithoutMedicamentoInput | LoteCreateOrConnectWithoutMedicamentoInput[]
    upsert?: LoteUpsertWithWhereUniqueWithoutMedicamentoInput | LoteUpsertWithWhereUniqueWithoutMedicamentoInput[]
    createMany?: LoteCreateManyMedicamentoInputEnvelope
    set?: LoteWhereUniqueInput | LoteWhereUniqueInput[]
    disconnect?: LoteWhereUniqueInput | LoteWhereUniqueInput[]
    delete?: LoteWhereUniqueInput | LoteWhereUniqueInput[]
    connect?: LoteWhereUniqueInput | LoteWhereUniqueInput[]
    update?: LoteUpdateWithWhereUniqueWithoutMedicamentoInput | LoteUpdateWithWhereUniqueWithoutMedicamentoInput[]
    updateMany?: LoteUpdateManyWithWhereWithoutMedicamentoInput | LoteUpdateManyWithWhereWithoutMedicamentoInput[]
    deleteMany?: LoteScalarWhereInput | LoteScalarWhereInput[]
  }

  export type DispensacaoItemUncheckedUpdateManyWithoutMedicamentoNestedInput = {
    create?: XOR<DispensacaoItemCreateWithoutMedicamentoInput, DispensacaoItemUncheckedCreateWithoutMedicamentoInput> | DispensacaoItemCreateWithoutMedicamentoInput[] | DispensacaoItemUncheckedCreateWithoutMedicamentoInput[]
    connectOrCreate?: DispensacaoItemCreateOrConnectWithoutMedicamentoInput | DispensacaoItemCreateOrConnectWithoutMedicamentoInput[]
    upsert?: DispensacaoItemUpsertWithWhereUniqueWithoutMedicamentoInput | DispensacaoItemUpsertWithWhereUniqueWithoutMedicamentoInput[]
    createMany?: DispensacaoItemCreateManyMedicamentoInputEnvelope
    set?: DispensacaoItemWhereUniqueInput | DispensacaoItemWhereUniqueInput[]
    disconnect?: DispensacaoItemWhereUniqueInput | DispensacaoItemWhereUniqueInput[]
    delete?: DispensacaoItemWhereUniqueInput | DispensacaoItemWhereUniqueInput[]
    connect?: DispensacaoItemWhereUniqueInput | DispensacaoItemWhereUniqueInput[]
    update?: DispensacaoItemUpdateWithWhereUniqueWithoutMedicamentoInput | DispensacaoItemUpdateWithWhereUniqueWithoutMedicamentoInput[]
    updateMany?: DispensacaoItemUpdateManyWithWhereWithoutMedicamentoInput | DispensacaoItemUpdateManyWithWhereWithoutMedicamentoInput[]
    deleteMany?: DispensacaoItemScalarWhereInput | DispensacaoItemScalarWhereInput[]
  }

  export type EmbalageFracionadaUncheckedUpdateManyWithoutMedicamentoNestedInput = {
    create?: XOR<EmbalageFracionadaCreateWithoutMedicamentoInput, EmbalageFracionadaUncheckedCreateWithoutMedicamentoInput> | EmbalageFracionadaCreateWithoutMedicamentoInput[] | EmbalageFracionadaUncheckedCreateWithoutMedicamentoInput[]
    connectOrCreate?: EmbalageFracionadaCreateOrConnectWithoutMedicamentoInput | EmbalageFracionadaCreateOrConnectWithoutMedicamentoInput[]
    upsert?: EmbalageFracionadaUpsertWithWhereUniqueWithoutMedicamentoInput | EmbalageFracionadaUpsertWithWhereUniqueWithoutMedicamentoInput[]
    createMany?: EmbalageFracionadaCreateManyMedicamentoInputEnvelope
    set?: EmbalageFracionadaWhereUniqueInput | EmbalageFracionadaWhereUniqueInput[]
    disconnect?: EmbalageFracionadaWhereUniqueInput | EmbalageFracionadaWhereUniqueInput[]
    delete?: EmbalageFracionadaWhereUniqueInput | EmbalageFracionadaWhereUniqueInput[]
    connect?: EmbalageFracionadaWhereUniqueInput | EmbalageFracionadaWhereUniqueInput[]
    update?: EmbalageFracionadaUpdateWithWhereUniqueWithoutMedicamentoInput | EmbalageFracionadaUpdateWithWhereUniqueWithoutMedicamentoInput[]
    updateMany?: EmbalageFracionadaUpdateManyWithWhereWithoutMedicamentoInput | EmbalageFracionadaUpdateManyWithWhereWithoutMedicamentoInput[]
    deleteMany?: EmbalageFracionadaScalarWhereInput | EmbalageFracionadaScalarWhereInput[]
  }

  export type MedicamentoCreateNestedOneWithoutLotesInput = {
    create?: XOR<MedicamentoCreateWithoutLotesInput, MedicamentoUncheckedCreateWithoutLotesInput>
    connectOrCreate?: MedicamentoCreateOrConnectWithoutLotesInput
    connect?: MedicamentoWhereUniqueInput
  }

  export type DispensacaoItemCreateNestedManyWithoutLoteInput = {
    create?: XOR<DispensacaoItemCreateWithoutLoteInput, DispensacaoItemUncheckedCreateWithoutLoteInput> | DispensacaoItemCreateWithoutLoteInput[] | DispensacaoItemUncheckedCreateWithoutLoteInput[]
    connectOrCreate?: DispensacaoItemCreateOrConnectWithoutLoteInput | DispensacaoItemCreateOrConnectWithoutLoteInput[]
    createMany?: DispensacaoItemCreateManyLoteInputEnvelope
    connect?: DispensacaoItemWhereUniqueInput | DispensacaoItemWhereUniqueInput[]
  }

  export type EmbalageFracionadaCreateNestedManyWithoutLoteInput = {
    create?: XOR<EmbalageFracionadaCreateWithoutLoteInput, EmbalageFracionadaUncheckedCreateWithoutLoteInput> | EmbalageFracionadaCreateWithoutLoteInput[] | EmbalageFracionadaUncheckedCreateWithoutLoteInput[]
    connectOrCreate?: EmbalageFracionadaCreateOrConnectWithoutLoteInput | EmbalageFracionadaCreateOrConnectWithoutLoteInput[]
    createMany?: EmbalageFracionadaCreateManyLoteInputEnvelope
    connect?: EmbalageFracionadaWhereUniqueInput | EmbalageFracionadaWhereUniqueInput[]
  }

  export type DispensacaoItemUncheckedCreateNestedManyWithoutLoteInput = {
    create?: XOR<DispensacaoItemCreateWithoutLoteInput, DispensacaoItemUncheckedCreateWithoutLoteInput> | DispensacaoItemCreateWithoutLoteInput[] | DispensacaoItemUncheckedCreateWithoutLoteInput[]
    connectOrCreate?: DispensacaoItemCreateOrConnectWithoutLoteInput | DispensacaoItemCreateOrConnectWithoutLoteInput[]
    createMany?: DispensacaoItemCreateManyLoteInputEnvelope
    connect?: DispensacaoItemWhereUniqueInput | DispensacaoItemWhereUniqueInput[]
  }

  export type EmbalageFracionadaUncheckedCreateNestedManyWithoutLoteInput = {
    create?: XOR<EmbalageFracionadaCreateWithoutLoteInput, EmbalageFracionadaUncheckedCreateWithoutLoteInput> | EmbalageFracionadaCreateWithoutLoteInput[] | EmbalageFracionadaUncheckedCreateWithoutLoteInput[]
    connectOrCreate?: EmbalageFracionadaCreateOrConnectWithoutLoteInput | EmbalageFracionadaCreateOrConnectWithoutLoteInput[]
    createMany?: EmbalageFracionadaCreateManyLoteInputEnvelope
    connect?: EmbalageFracionadaWhereUniqueInput | EmbalageFracionadaWhereUniqueInput[]
  }

  export type MedicamentoUpdateOneRequiredWithoutLotesNestedInput = {
    create?: XOR<MedicamentoCreateWithoutLotesInput, MedicamentoUncheckedCreateWithoutLotesInput>
    connectOrCreate?: MedicamentoCreateOrConnectWithoutLotesInput
    upsert?: MedicamentoUpsertWithoutLotesInput
    connect?: MedicamentoWhereUniqueInput
    update?: XOR<XOR<MedicamentoUpdateToOneWithWhereWithoutLotesInput, MedicamentoUpdateWithoutLotesInput>, MedicamentoUncheckedUpdateWithoutLotesInput>
  }

  export type DispensacaoItemUpdateManyWithoutLoteNestedInput = {
    create?: XOR<DispensacaoItemCreateWithoutLoteInput, DispensacaoItemUncheckedCreateWithoutLoteInput> | DispensacaoItemCreateWithoutLoteInput[] | DispensacaoItemUncheckedCreateWithoutLoteInput[]
    connectOrCreate?: DispensacaoItemCreateOrConnectWithoutLoteInput | DispensacaoItemCreateOrConnectWithoutLoteInput[]
    upsert?: DispensacaoItemUpsertWithWhereUniqueWithoutLoteInput | DispensacaoItemUpsertWithWhereUniqueWithoutLoteInput[]
    createMany?: DispensacaoItemCreateManyLoteInputEnvelope
    set?: DispensacaoItemWhereUniqueInput | DispensacaoItemWhereUniqueInput[]
    disconnect?: DispensacaoItemWhereUniqueInput | DispensacaoItemWhereUniqueInput[]
    delete?: DispensacaoItemWhereUniqueInput | DispensacaoItemWhereUniqueInput[]
    connect?: DispensacaoItemWhereUniqueInput | DispensacaoItemWhereUniqueInput[]
    update?: DispensacaoItemUpdateWithWhereUniqueWithoutLoteInput | DispensacaoItemUpdateWithWhereUniqueWithoutLoteInput[]
    updateMany?: DispensacaoItemUpdateManyWithWhereWithoutLoteInput | DispensacaoItemUpdateManyWithWhereWithoutLoteInput[]
    deleteMany?: DispensacaoItemScalarWhereInput | DispensacaoItemScalarWhereInput[]
  }

  export type EmbalageFracionadaUpdateManyWithoutLoteNestedInput = {
    create?: XOR<EmbalageFracionadaCreateWithoutLoteInput, EmbalageFracionadaUncheckedCreateWithoutLoteInput> | EmbalageFracionadaCreateWithoutLoteInput[] | EmbalageFracionadaUncheckedCreateWithoutLoteInput[]
    connectOrCreate?: EmbalageFracionadaCreateOrConnectWithoutLoteInput | EmbalageFracionadaCreateOrConnectWithoutLoteInput[]
    upsert?: EmbalageFracionadaUpsertWithWhereUniqueWithoutLoteInput | EmbalageFracionadaUpsertWithWhereUniqueWithoutLoteInput[]
    createMany?: EmbalageFracionadaCreateManyLoteInputEnvelope
    set?: EmbalageFracionadaWhereUniqueInput | EmbalageFracionadaWhereUniqueInput[]
    disconnect?: EmbalageFracionadaWhereUniqueInput | EmbalageFracionadaWhereUniqueInput[]
    delete?: EmbalageFracionadaWhereUniqueInput | EmbalageFracionadaWhereUniqueInput[]
    connect?: EmbalageFracionadaWhereUniqueInput | EmbalageFracionadaWhereUniqueInput[]
    update?: EmbalageFracionadaUpdateWithWhereUniqueWithoutLoteInput | EmbalageFracionadaUpdateWithWhereUniqueWithoutLoteInput[]
    updateMany?: EmbalageFracionadaUpdateManyWithWhereWithoutLoteInput | EmbalageFracionadaUpdateManyWithWhereWithoutLoteInput[]
    deleteMany?: EmbalageFracionadaScalarWhereInput | EmbalageFracionadaScalarWhereInput[]
  }

  export type DispensacaoItemUncheckedUpdateManyWithoutLoteNestedInput = {
    create?: XOR<DispensacaoItemCreateWithoutLoteInput, DispensacaoItemUncheckedCreateWithoutLoteInput> | DispensacaoItemCreateWithoutLoteInput[] | DispensacaoItemUncheckedCreateWithoutLoteInput[]
    connectOrCreate?: DispensacaoItemCreateOrConnectWithoutLoteInput | DispensacaoItemCreateOrConnectWithoutLoteInput[]
    upsert?: DispensacaoItemUpsertWithWhereUniqueWithoutLoteInput | DispensacaoItemUpsertWithWhereUniqueWithoutLoteInput[]
    createMany?: DispensacaoItemCreateManyLoteInputEnvelope
    set?: DispensacaoItemWhereUniqueInput | DispensacaoItemWhereUniqueInput[]
    disconnect?: DispensacaoItemWhereUniqueInput | DispensacaoItemWhereUniqueInput[]
    delete?: DispensacaoItemWhereUniqueInput | DispensacaoItemWhereUniqueInput[]
    connect?: DispensacaoItemWhereUniqueInput | DispensacaoItemWhereUniqueInput[]
    update?: DispensacaoItemUpdateWithWhereUniqueWithoutLoteInput | DispensacaoItemUpdateWithWhereUniqueWithoutLoteInput[]
    updateMany?: DispensacaoItemUpdateManyWithWhereWithoutLoteInput | DispensacaoItemUpdateManyWithWhereWithoutLoteInput[]
    deleteMany?: DispensacaoItemScalarWhereInput | DispensacaoItemScalarWhereInput[]
  }

  export type EmbalageFracionadaUncheckedUpdateManyWithoutLoteNestedInput = {
    create?: XOR<EmbalageFracionadaCreateWithoutLoteInput, EmbalageFracionadaUncheckedCreateWithoutLoteInput> | EmbalageFracionadaCreateWithoutLoteInput[] | EmbalageFracionadaUncheckedCreateWithoutLoteInput[]
    connectOrCreate?: EmbalageFracionadaCreateOrConnectWithoutLoteInput | EmbalageFracionadaCreateOrConnectWithoutLoteInput[]
    upsert?: EmbalageFracionadaUpsertWithWhereUniqueWithoutLoteInput | EmbalageFracionadaUpsertWithWhereUniqueWithoutLoteInput[]
    createMany?: EmbalageFracionadaCreateManyLoteInputEnvelope
    set?: EmbalageFracionadaWhereUniqueInput | EmbalageFracionadaWhereUniqueInput[]
    disconnect?: EmbalageFracionadaWhereUniqueInput | EmbalageFracionadaWhereUniqueInput[]
    delete?: EmbalageFracionadaWhereUniqueInput | EmbalageFracionadaWhereUniqueInput[]
    connect?: EmbalageFracionadaWhereUniqueInput | EmbalageFracionadaWhereUniqueInput[]
    update?: EmbalageFracionadaUpdateWithWhereUniqueWithoutLoteInput | EmbalageFracionadaUpdateWithWhereUniqueWithoutLoteInput[]
    updateMany?: EmbalageFracionadaUpdateManyWithWhereWithoutLoteInput | EmbalageFracionadaUpdateManyWithWhereWithoutLoteInput[]
    deleteMany?: EmbalageFracionadaScalarWhereInput | EmbalageFracionadaScalarWhereInput[]
  }

  export type PrescricaoCreateNestedManyWithoutPacienteInput = {
    create?: XOR<PrescricaoCreateWithoutPacienteInput, PrescricaoUncheckedCreateWithoutPacienteInput> | PrescricaoCreateWithoutPacienteInput[] | PrescricaoUncheckedCreateWithoutPacienteInput[]
    connectOrCreate?: PrescricaoCreateOrConnectWithoutPacienteInput | PrescricaoCreateOrConnectWithoutPacienteInput[]
    createMany?: PrescricaoCreateManyPacienteInputEnvelope
    connect?: PrescricaoWhereUniqueInput | PrescricaoWhereUniqueInput[]
  }

  export type DispensacaoCreateNestedManyWithoutPacienteInput = {
    create?: XOR<DispensacaoCreateWithoutPacienteInput, DispensacaoUncheckedCreateWithoutPacienteInput> | DispensacaoCreateWithoutPacienteInput[] | DispensacaoUncheckedCreateWithoutPacienteInput[]
    connectOrCreate?: DispensacaoCreateOrConnectWithoutPacienteInput | DispensacaoCreateOrConnectWithoutPacienteInput[]
    createMany?: DispensacaoCreateManyPacienteInputEnvelope
    connect?: DispensacaoWhereUniqueInput | DispensacaoWhereUniqueInput[]
  }

  export type PrescricaoUncheckedCreateNestedManyWithoutPacienteInput = {
    create?: XOR<PrescricaoCreateWithoutPacienteInput, PrescricaoUncheckedCreateWithoutPacienteInput> | PrescricaoCreateWithoutPacienteInput[] | PrescricaoUncheckedCreateWithoutPacienteInput[]
    connectOrCreate?: PrescricaoCreateOrConnectWithoutPacienteInput | PrescricaoCreateOrConnectWithoutPacienteInput[]
    createMany?: PrescricaoCreateManyPacienteInputEnvelope
    connect?: PrescricaoWhereUniqueInput | PrescricaoWhereUniqueInput[]
  }

  export type DispensacaoUncheckedCreateNestedManyWithoutPacienteInput = {
    create?: XOR<DispensacaoCreateWithoutPacienteInput, DispensacaoUncheckedCreateWithoutPacienteInput> | DispensacaoCreateWithoutPacienteInput[] | DispensacaoUncheckedCreateWithoutPacienteInput[]
    connectOrCreate?: DispensacaoCreateOrConnectWithoutPacienteInput | DispensacaoCreateOrConnectWithoutPacienteInput[]
    createMany?: DispensacaoCreateManyPacienteInputEnvelope
    connect?: DispensacaoWhereUniqueInput | DispensacaoWhereUniqueInput[]
  }

  export type PrescricaoUpdateManyWithoutPacienteNestedInput = {
    create?: XOR<PrescricaoCreateWithoutPacienteInput, PrescricaoUncheckedCreateWithoutPacienteInput> | PrescricaoCreateWithoutPacienteInput[] | PrescricaoUncheckedCreateWithoutPacienteInput[]
    connectOrCreate?: PrescricaoCreateOrConnectWithoutPacienteInput | PrescricaoCreateOrConnectWithoutPacienteInput[]
    upsert?: PrescricaoUpsertWithWhereUniqueWithoutPacienteInput | PrescricaoUpsertWithWhereUniqueWithoutPacienteInput[]
    createMany?: PrescricaoCreateManyPacienteInputEnvelope
    set?: PrescricaoWhereUniqueInput | PrescricaoWhereUniqueInput[]
    disconnect?: PrescricaoWhereUniqueInput | PrescricaoWhereUniqueInput[]
    delete?: PrescricaoWhereUniqueInput | PrescricaoWhereUniqueInput[]
    connect?: PrescricaoWhereUniqueInput | PrescricaoWhereUniqueInput[]
    update?: PrescricaoUpdateWithWhereUniqueWithoutPacienteInput | PrescricaoUpdateWithWhereUniqueWithoutPacienteInput[]
    updateMany?: PrescricaoUpdateManyWithWhereWithoutPacienteInput | PrescricaoUpdateManyWithWhereWithoutPacienteInput[]
    deleteMany?: PrescricaoScalarWhereInput | PrescricaoScalarWhereInput[]
  }

  export type DispensacaoUpdateManyWithoutPacienteNestedInput = {
    create?: XOR<DispensacaoCreateWithoutPacienteInput, DispensacaoUncheckedCreateWithoutPacienteInput> | DispensacaoCreateWithoutPacienteInput[] | DispensacaoUncheckedCreateWithoutPacienteInput[]
    connectOrCreate?: DispensacaoCreateOrConnectWithoutPacienteInput | DispensacaoCreateOrConnectWithoutPacienteInput[]
    upsert?: DispensacaoUpsertWithWhereUniqueWithoutPacienteInput | DispensacaoUpsertWithWhereUniqueWithoutPacienteInput[]
    createMany?: DispensacaoCreateManyPacienteInputEnvelope
    set?: DispensacaoWhereUniqueInput | DispensacaoWhereUniqueInput[]
    disconnect?: DispensacaoWhereUniqueInput | DispensacaoWhereUniqueInput[]
    delete?: DispensacaoWhereUniqueInput | DispensacaoWhereUniqueInput[]
    connect?: DispensacaoWhereUniqueInput | DispensacaoWhereUniqueInput[]
    update?: DispensacaoUpdateWithWhereUniqueWithoutPacienteInput | DispensacaoUpdateWithWhereUniqueWithoutPacienteInput[]
    updateMany?: DispensacaoUpdateManyWithWhereWithoutPacienteInput | DispensacaoUpdateManyWithWhereWithoutPacienteInput[]
    deleteMany?: DispensacaoScalarWhereInput | DispensacaoScalarWhereInput[]
  }

  export type PrescricaoUncheckedUpdateManyWithoutPacienteNestedInput = {
    create?: XOR<PrescricaoCreateWithoutPacienteInput, PrescricaoUncheckedCreateWithoutPacienteInput> | PrescricaoCreateWithoutPacienteInput[] | PrescricaoUncheckedCreateWithoutPacienteInput[]
    connectOrCreate?: PrescricaoCreateOrConnectWithoutPacienteInput | PrescricaoCreateOrConnectWithoutPacienteInput[]
    upsert?: PrescricaoUpsertWithWhereUniqueWithoutPacienteInput | PrescricaoUpsertWithWhereUniqueWithoutPacienteInput[]
    createMany?: PrescricaoCreateManyPacienteInputEnvelope
    set?: PrescricaoWhereUniqueInput | PrescricaoWhereUniqueInput[]
    disconnect?: PrescricaoWhereUniqueInput | PrescricaoWhereUniqueInput[]
    delete?: PrescricaoWhereUniqueInput | PrescricaoWhereUniqueInput[]
    connect?: PrescricaoWhereUniqueInput | PrescricaoWhereUniqueInput[]
    update?: PrescricaoUpdateWithWhereUniqueWithoutPacienteInput | PrescricaoUpdateWithWhereUniqueWithoutPacienteInput[]
    updateMany?: PrescricaoUpdateManyWithWhereWithoutPacienteInput | PrescricaoUpdateManyWithWhereWithoutPacienteInput[]
    deleteMany?: PrescricaoScalarWhereInput | PrescricaoScalarWhereInput[]
  }

  export type DispensacaoUncheckedUpdateManyWithoutPacienteNestedInput = {
    create?: XOR<DispensacaoCreateWithoutPacienteInput, DispensacaoUncheckedCreateWithoutPacienteInput> | DispensacaoCreateWithoutPacienteInput[] | DispensacaoUncheckedCreateWithoutPacienteInput[]
    connectOrCreate?: DispensacaoCreateOrConnectWithoutPacienteInput | DispensacaoCreateOrConnectWithoutPacienteInput[]
    upsert?: DispensacaoUpsertWithWhereUniqueWithoutPacienteInput | DispensacaoUpsertWithWhereUniqueWithoutPacienteInput[]
    createMany?: DispensacaoCreateManyPacienteInputEnvelope
    set?: DispensacaoWhereUniqueInput | DispensacaoWhereUniqueInput[]
    disconnect?: DispensacaoWhereUniqueInput | DispensacaoWhereUniqueInput[]
    delete?: DispensacaoWhereUniqueInput | DispensacaoWhereUniqueInput[]
    connect?: DispensacaoWhereUniqueInput | DispensacaoWhereUniqueInput[]
    update?: DispensacaoUpdateWithWhereUniqueWithoutPacienteInput | DispensacaoUpdateWithWhereUniqueWithoutPacienteInput[]
    updateMany?: DispensacaoUpdateManyWithWhereWithoutPacienteInput | DispensacaoUpdateManyWithWhereWithoutPacienteInput[]
    deleteMany?: DispensacaoScalarWhereInput | DispensacaoScalarWhereInput[]
  }

  export type PacienteCreateNestedOneWithoutPrescricoesInput = {
    create?: XOR<PacienteCreateWithoutPrescricoesInput, PacienteUncheckedCreateWithoutPrescricoesInput>
    connectOrCreate?: PacienteCreateOrConnectWithoutPrescricoesInput
    connect?: PacienteWhereUniqueInput
  }

  export type DispensacaoCreateNestedManyWithoutPrescricaoInput = {
    create?: XOR<DispensacaoCreateWithoutPrescricaoInput, DispensacaoUncheckedCreateWithoutPrescricaoInput> | DispensacaoCreateWithoutPrescricaoInput[] | DispensacaoUncheckedCreateWithoutPrescricaoInput[]
    connectOrCreate?: DispensacaoCreateOrConnectWithoutPrescricaoInput | DispensacaoCreateOrConnectWithoutPrescricaoInput[]
    createMany?: DispensacaoCreateManyPrescricaoInputEnvelope
    connect?: DispensacaoWhereUniqueInput | DispensacaoWhereUniqueInput[]
  }

  export type DispensacaoUncheckedCreateNestedManyWithoutPrescricaoInput = {
    create?: XOR<DispensacaoCreateWithoutPrescricaoInput, DispensacaoUncheckedCreateWithoutPrescricaoInput> | DispensacaoCreateWithoutPrescricaoInput[] | DispensacaoUncheckedCreateWithoutPrescricaoInput[]
    connectOrCreate?: DispensacaoCreateOrConnectWithoutPrescricaoInput | DispensacaoCreateOrConnectWithoutPrescricaoInput[]
    createMany?: DispensacaoCreateManyPrescricaoInputEnvelope
    connect?: DispensacaoWhereUniqueInput | DispensacaoWhereUniqueInput[]
  }

  export type PacienteUpdateOneRequiredWithoutPrescricoesNestedInput = {
    create?: XOR<PacienteCreateWithoutPrescricoesInput, PacienteUncheckedCreateWithoutPrescricoesInput>
    connectOrCreate?: PacienteCreateOrConnectWithoutPrescricoesInput
    upsert?: PacienteUpsertWithoutPrescricoesInput
    connect?: PacienteWhereUniqueInput
    update?: XOR<XOR<PacienteUpdateToOneWithWhereWithoutPrescricoesInput, PacienteUpdateWithoutPrescricoesInput>, PacienteUncheckedUpdateWithoutPrescricoesInput>
  }

  export type DispensacaoUpdateManyWithoutPrescricaoNestedInput = {
    create?: XOR<DispensacaoCreateWithoutPrescricaoInput, DispensacaoUncheckedCreateWithoutPrescricaoInput> | DispensacaoCreateWithoutPrescricaoInput[] | DispensacaoUncheckedCreateWithoutPrescricaoInput[]
    connectOrCreate?: DispensacaoCreateOrConnectWithoutPrescricaoInput | DispensacaoCreateOrConnectWithoutPrescricaoInput[]
    upsert?: DispensacaoUpsertWithWhereUniqueWithoutPrescricaoInput | DispensacaoUpsertWithWhereUniqueWithoutPrescricaoInput[]
    createMany?: DispensacaoCreateManyPrescricaoInputEnvelope
    set?: DispensacaoWhereUniqueInput | DispensacaoWhereUniqueInput[]
    disconnect?: DispensacaoWhereUniqueInput | DispensacaoWhereUniqueInput[]
    delete?: DispensacaoWhereUniqueInput | DispensacaoWhereUniqueInput[]
    connect?: DispensacaoWhereUniqueInput | DispensacaoWhereUniqueInput[]
    update?: DispensacaoUpdateWithWhereUniqueWithoutPrescricaoInput | DispensacaoUpdateWithWhereUniqueWithoutPrescricaoInput[]
    updateMany?: DispensacaoUpdateManyWithWhereWithoutPrescricaoInput | DispensacaoUpdateManyWithWhereWithoutPrescricaoInput[]
    deleteMany?: DispensacaoScalarWhereInput | DispensacaoScalarWhereInput[]
  }

  export type DispensacaoUncheckedUpdateManyWithoutPrescricaoNestedInput = {
    create?: XOR<DispensacaoCreateWithoutPrescricaoInput, DispensacaoUncheckedCreateWithoutPrescricaoInput> | DispensacaoCreateWithoutPrescricaoInput[] | DispensacaoUncheckedCreateWithoutPrescricaoInput[]
    connectOrCreate?: DispensacaoCreateOrConnectWithoutPrescricaoInput | DispensacaoCreateOrConnectWithoutPrescricaoInput[]
    upsert?: DispensacaoUpsertWithWhereUniqueWithoutPrescricaoInput | DispensacaoUpsertWithWhereUniqueWithoutPrescricaoInput[]
    createMany?: DispensacaoCreateManyPrescricaoInputEnvelope
    set?: DispensacaoWhereUniqueInput | DispensacaoWhereUniqueInput[]
    disconnect?: DispensacaoWhereUniqueInput | DispensacaoWhereUniqueInput[]
    delete?: DispensacaoWhereUniqueInput | DispensacaoWhereUniqueInput[]
    connect?: DispensacaoWhereUniqueInput | DispensacaoWhereUniqueInput[]
    update?: DispensacaoUpdateWithWhereUniqueWithoutPrescricaoInput | DispensacaoUpdateWithWhereUniqueWithoutPrescricaoInput[]
    updateMany?: DispensacaoUpdateManyWithWhereWithoutPrescricaoInput | DispensacaoUpdateManyWithWhereWithoutPrescricaoInput[]
    deleteMany?: DispensacaoScalarWhereInput | DispensacaoScalarWhereInput[]
  }

  export type PacienteCreateNestedOneWithoutDispensacoesInput = {
    create?: XOR<PacienteCreateWithoutDispensacoesInput, PacienteUncheckedCreateWithoutDispensacoesInput>
    connectOrCreate?: PacienteCreateOrConnectWithoutDispensacoesInput
    connect?: PacienteWhereUniqueInput
  }

  export type PrescricaoCreateNestedOneWithoutDispensacoesInput = {
    create?: XOR<PrescricaoCreateWithoutDispensacoesInput, PrescricaoUncheckedCreateWithoutDispensacoesInput>
    connectOrCreate?: PrescricaoCreateOrConnectWithoutDispensacoesInput
    connect?: PrescricaoWhereUniqueInput
  }

  export type DispensacaoItemCreateNestedManyWithoutDispensacaoInput = {
    create?: XOR<DispensacaoItemCreateWithoutDispensacaoInput, DispensacaoItemUncheckedCreateWithoutDispensacaoInput> | DispensacaoItemCreateWithoutDispensacaoInput[] | DispensacaoItemUncheckedCreateWithoutDispensacaoInput[]
    connectOrCreate?: DispensacaoItemCreateOrConnectWithoutDispensacaoInput | DispensacaoItemCreateOrConnectWithoutDispensacaoInput[]
    createMany?: DispensacaoItemCreateManyDispensacaoInputEnvelope
    connect?: DispensacaoItemWhereUniqueInput | DispensacaoItemWhereUniqueInput[]
  }

  export type DispensacaoItemUncheckedCreateNestedManyWithoutDispensacaoInput = {
    create?: XOR<DispensacaoItemCreateWithoutDispensacaoInput, DispensacaoItemUncheckedCreateWithoutDispensacaoInput> | DispensacaoItemCreateWithoutDispensacaoInput[] | DispensacaoItemUncheckedCreateWithoutDispensacaoInput[]
    connectOrCreate?: DispensacaoItemCreateOrConnectWithoutDispensacaoInput | DispensacaoItemCreateOrConnectWithoutDispensacaoInput[]
    createMany?: DispensacaoItemCreateManyDispensacaoInputEnvelope
    connect?: DispensacaoItemWhereUniqueInput | DispensacaoItemWhereUniqueInput[]
  }

  export type PacienteUpdateOneRequiredWithoutDispensacoesNestedInput = {
    create?: XOR<PacienteCreateWithoutDispensacoesInput, PacienteUncheckedCreateWithoutDispensacoesInput>
    connectOrCreate?: PacienteCreateOrConnectWithoutDispensacoesInput
    upsert?: PacienteUpsertWithoutDispensacoesInput
    connect?: PacienteWhereUniqueInput
    update?: XOR<XOR<PacienteUpdateToOneWithWhereWithoutDispensacoesInput, PacienteUpdateWithoutDispensacoesInput>, PacienteUncheckedUpdateWithoutDispensacoesInput>
  }

  export type PrescricaoUpdateOneWithoutDispensacoesNestedInput = {
    create?: XOR<PrescricaoCreateWithoutDispensacoesInput, PrescricaoUncheckedCreateWithoutDispensacoesInput>
    connectOrCreate?: PrescricaoCreateOrConnectWithoutDispensacoesInput
    upsert?: PrescricaoUpsertWithoutDispensacoesInput
    disconnect?: PrescricaoWhereInput | boolean
    delete?: PrescricaoWhereInput | boolean
    connect?: PrescricaoWhereUniqueInput
    update?: XOR<XOR<PrescricaoUpdateToOneWithWhereWithoutDispensacoesInput, PrescricaoUpdateWithoutDispensacoesInput>, PrescricaoUncheckedUpdateWithoutDispensacoesInput>
  }

  export type DispensacaoItemUpdateManyWithoutDispensacaoNestedInput = {
    create?: XOR<DispensacaoItemCreateWithoutDispensacaoInput, DispensacaoItemUncheckedCreateWithoutDispensacaoInput> | DispensacaoItemCreateWithoutDispensacaoInput[] | DispensacaoItemUncheckedCreateWithoutDispensacaoInput[]
    connectOrCreate?: DispensacaoItemCreateOrConnectWithoutDispensacaoInput | DispensacaoItemCreateOrConnectWithoutDispensacaoInput[]
    upsert?: DispensacaoItemUpsertWithWhereUniqueWithoutDispensacaoInput | DispensacaoItemUpsertWithWhereUniqueWithoutDispensacaoInput[]
    createMany?: DispensacaoItemCreateManyDispensacaoInputEnvelope
    set?: DispensacaoItemWhereUniqueInput | DispensacaoItemWhereUniqueInput[]
    disconnect?: DispensacaoItemWhereUniqueInput | DispensacaoItemWhereUniqueInput[]
    delete?: DispensacaoItemWhereUniqueInput | DispensacaoItemWhereUniqueInput[]
    connect?: DispensacaoItemWhereUniqueInput | DispensacaoItemWhereUniqueInput[]
    update?: DispensacaoItemUpdateWithWhereUniqueWithoutDispensacaoInput | DispensacaoItemUpdateWithWhereUniqueWithoutDispensacaoInput[]
    updateMany?: DispensacaoItemUpdateManyWithWhereWithoutDispensacaoInput | DispensacaoItemUpdateManyWithWhereWithoutDispensacaoInput[]
    deleteMany?: DispensacaoItemScalarWhereInput | DispensacaoItemScalarWhereInput[]
  }

  export type DispensacaoItemUncheckedUpdateManyWithoutDispensacaoNestedInput = {
    create?: XOR<DispensacaoItemCreateWithoutDispensacaoInput, DispensacaoItemUncheckedCreateWithoutDispensacaoInput> | DispensacaoItemCreateWithoutDispensacaoInput[] | DispensacaoItemUncheckedCreateWithoutDispensacaoInput[]
    connectOrCreate?: DispensacaoItemCreateOrConnectWithoutDispensacaoInput | DispensacaoItemCreateOrConnectWithoutDispensacaoInput[]
    upsert?: DispensacaoItemUpsertWithWhereUniqueWithoutDispensacaoInput | DispensacaoItemUpsertWithWhereUniqueWithoutDispensacaoInput[]
    createMany?: DispensacaoItemCreateManyDispensacaoInputEnvelope
    set?: DispensacaoItemWhereUniqueInput | DispensacaoItemWhereUniqueInput[]
    disconnect?: DispensacaoItemWhereUniqueInput | DispensacaoItemWhereUniqueInput[]
    delete?: DispensacaoItemWhereUniqueInput | DispensacaoItemWhereUniqueInput[]
    connect?: DispensacaoItemWhereUniqueInput | DispensacaoItemWhereUniqueInput[]
    update?: DispensacaoItemUpdateWithWhereUniqueWithoutDispensacaoInput | DispensacaoItemUpdateWithWhereUniqueWithoutDispensacaoInput[]
    updateMany?: DispensacaoItemUpdateManyWithWhereWithoutDispensacaoInput | DispensacaoItemUpdateManyWithWhereWithoutDispensacaoInput[]
    deleteMany?: DispensacaoItemScalarWhereInput | DispensacaoItemScalarWhereInput[]
  }

  export type DispensacaoCreateNestedOneWithoutItensInput = {
    create?: XOR<DispensacaoCreateWithoutItensInput, DispensacaoUncheckedCreateWithoutItensInput>
    connectOrCreate?: DispensacaoCreateOrConnectWithoutItensInput
    connect?: DispensacaoWhereUniqueInput
  }

  export type MedicamentoCreateNestedOneWithoutDispensacaoItensInput = {
    create?: XOR<MedicamentoCreateWithoutDispensacaoItensInput, MedicamentoUncheckedCreateWithoutDispensacaoItensInput>
    connectOrCreate?: MedicamentoCreateOrConnectWithoutDispensacaoItensInput
    connect?: MedicamentoWhereUniqueInput
  }

  export type LoteCreateNestedOneWithoutDispensacaoItensInput = {
    create?: XOR<LoteCreateWithoutDispensacaoItensInput, LoteUncheckedCreateWithoutDispensacaoItensInput>
    connectOrCreate?: LoteCreateOrConnectWithoutDispensacaoItensInput
    connect?: LoteWhereUniqueInput
  }

  export type EmbalageFracionadaCreateNestedOneWithoutDispensacaoItensInput = {
    create?: XOR<EmbalageFracionadaCreateWithoutDispensacaoItensInput, EmbalageFracionadaUncheckedCreateWithoutDispensacaoItensInput>
    connectOrCreate?: EmbalageFracionadaCreateOrConnectWithoutDispensacaoItensInput
    connect?: EmbalageFracionadaWhereUniqueInput
  }

  export type DispensacaoUpdateOneRequiredWithoutItensNestedInput = {
    create?: XOR<DispensacaoCreateWithoutItensInput, DispensacaoUncheckedCreateWithoutItensInput>
    connectOrCreate?: DispensacaoCreateOrConnectWithoutItensInput
    upsert?: DispensacaoUpsertWithoutItensInput
    connect?: DispensacaoWhereUniqueInput
    update?: XOR<XOR<DispensacaoUpdateToOneWithWhereWithoutItensInput, DispensacaoUpdateWithoutItensInput>, DispensacaoUncheckedUpdateWithoutItensInput>
  }

  export type MedicamentoUpdateOneRequiredWithoutDispensacaoItensNestedInput = {
    create?: XOR<MedicamentoCreateWithoutDispensacaoItensInput, MedicamentoUncheckedCreateWithoutDispensacaoItensInput>
    connectOrCreate?: MedicamentoCreateOrConnectWithoutDispensacaoItensInput
    upsert?: MedicamentoUpsertWithoutDispensacaoItensInput
    connect?: MedicamentoWhereUniqueInput
    update?: XOR<XOR<MedicamentoUpdateToOneWithWhereWithoutDispensacaoItensInput, MedicamentoUpdateWithoutDispensacaoItensInput>, MedicamentoUncheckedUpdateWithoutDispensacaoItensInput>
  }

  export type LoteUpdateOneWithoutDispensacaoItensNestedInput = {
    create?: XOR<LoteCreateWithoutDispensacaoItensInput, LoteUncheckedCreateWithoutDispensacaoItensInput>
    connectOrCreate?: LoteCreateOrConnectWithoutDispensacaoItensInput
    upsert?: LoteUpsertWithoutDispensacaoItensInput
    disconnect?: LoteWhereInput | boolean
    delete?: LoteWhereInput | boolean
    connect?: LoteWhereUniqueInput
    update?: XOR<XOR<LoteUpdateToOneWithWhereWithoutDispensacaoItensInput, LoteUpdateWithoutDispensacaoItensInput>, LoteUncheckedUpdateWithoutDispensacaoItensInput>
  }

  export type EmbalageFracionadaUpdateOneWithoutDispensacaoItensNestedInput = {
    create?: XOR<EmbalageFracionadaCreateWithoutDispensacaoItensInput, EmbalageFracionadaUncheckedCreateWithoutDispensacaoItensInput>
    connectOrCreate?: EmbalageFracionadaCreateOrConnectWithoutDispensacaoItensInput
    upsert?: EmbalageFracionadaUpsertWithoutDispensacaoItensInput
    disconnect?: EmbalageFracionadaWhereInput | boolean
    delete?: EmbalageFracionadaWhereInput | boolean
    connect?: EmbalageFracionadaWhereUniqueInput
    update?: XOR<XOR<EmbalageFracionadaUpdateToOneWithWhereWithoutDispensacaoItensInput, EmbalageFracionadaUpdateWithoutDispensacaoItensInput>, EmbalageFracionadaUncheckedUpdateWithoutDispensacaoItensInput>
  }

  export type LoteCreateNestedOneWithoutEmbalagensFracionadasInput = {
    create?: XOR<LoteCreateWithoutEmbalagensFracionadasInput, LoteUncheckedCreateWithoutEmbalagensFracionadasInput>
    connectOrCreate?: LoteCreateOrConnectWithoutEmbalagensFracionadasInput
    connect?: LoteWhereUniqueInput
  }

  export type MedicamentoCreateNestedOneWithoutEmbalagensFracionadasInput = {
    create?: XOR<MedicamentoCreateWithoutEmbalagensFracionadasInput, MedicamentoUncheckedCreateWithoutEmbalagensFracionadasInput>
    connectOrCreate?: MedicamentoCreateOrConnectWithoutEmbalagensFracionadasInput
    connect?: MedicamentoWhereUniqueInput
  }

  export type DispensacaoItemCreateNestedManyWithoutEmbalagemInput = {
    create?: XOR<DispensacaoItemCreateWithoutEmbalagemInput, DispensacaoItemUncheckedCreateWithoutEmbalagemInput> | DispensacaoItemCreateWithoutEmbalagemInput[] | DispensacaoItemUncheckedCreateWithoutEmbalagemInput[]
    connectOrCreate?: DispensacaoItemCreateOrConnectWithoutEmbalagemInput | DispensacaoItemCreateOrConnectWithoutEmbalagemInput[]
    createMany?: DispensacaoItemCreateManyEmbalagemInputEnvelope
    connect?: DispensacaoItemWhereUniqueInput | DispensacaoItemWhereUniqueInput[]
  }

  export type MovimentacaoFracionadaCreateNestedManyWithoutEmbalagemInput = {
    create?: XOR<MovimentacaoFracionadaCreateWithoutEmbalagemInput, MovimentacaoFracionadaUncheckedCreateWithoutEmbalagemInput> | MovimentacaoFracionadaCreateWithoutEmbalagemInput[] | MovimentacaoFracionadaUncheckedCreateWithoutEmbalagemInput[]
    connectOrCreate?: MovimentacaoFracionadaCreateOrConnectWithoutEmbalagemInput | MovimentacaoFracionadaCreateOrConnectWithoutEmbalagemInput[]
    createMany?: MovimentacaoFracionadaCreateManyEmbalagemInputEnvelope
    connect?: MovimentacaoFracionadaWhereUniqueInput | MovimentacaoFracionadaWhereUniqueInput[]
  }

  export type DispensacaoItemUncheckedCreateNestedManyWithoutEmbalagemInput = {
    create?: XOR<DispensacaoItemCreateWithoutEmbalagemInput, DispensacaoItemUncheckedCreateWithoutEmbalagemInput> | DispensacaoItemCreateWithoutEmbalagemInput[] | DispensacaoItemUncheckedCreateWithoutEmbalagemInput[]
    connectOrCreate?: DispensacaoItemCreateOrConnectWithoutEmbalagemInput | DispensacaoItemCreateOrConnectWithoutEmbalagemInput[]
    createMany?: DispensacaoItemCreateManyEmbalagemInputEnvelope
    connect?: DispensacaoItemWhereUniqueInput | DispensacaoItemWhereUniqueInput[]
  }

  export type MovimentacaoFracionadaUncheckedCreateNestedManyWithoutEmbalagemInput = {
    create?: XOR<MovimentacaoFracionadaCreateWithoutEmbalagemInput, MovimentacaoFracionadaUncheckedCreateWithoutEmbalagemInput> | MovimentacaoFracionadaCreateWithoutEmbalagemInput[] | MovimentacaoFracionadaUncheckedCreateWithoutEmbalagemInput[]
    connectOrCreate?: MovimentacaoFracionadaCreateOrConnectWithoutEmbalagemInput | MovimentacaoFracionadaCreateOrConnectWithoutEmbalagemInput[]
    createMany?: MovimentacaoFracionadaCreateManyEmbalagemInputEnvelope
    connect?: MovimentacaoFracionadaWhereUniqueInput | MovimentacaoFracionadaWhereUniqueInput[]
  }

  export type LoteUpdateOneRequiredWithoutEmbalagensFracionadasNestedInput = {
    create?: XOR<LoteCreateWithoutEmbalagensFracionadasInput, LoteUncheckedCreateWithoutEmbalagensFracionadasInput>
    connectOrCreate?: LoteCreateOrConnectWithoutEmbalagensFracionadasInput
    upsert?: LoteUpsertWithoutEmbalagensFracionadasInput
    connect?: LoteWhereUniqueInput
    update?: XOR<XOR<LoteUpdateToOneWithWhereWithoutEmbalagensFracionadasInput, LoteUpdateWithoutEmbalagensFracionadasInput>, LoteUncheckedUpdateWithoutEmbalagensFracionadasInput>
  }

  export type MedicamentoUpdateOneRequiredWithoutEmbalagensFracionadasNestedInput = {
    create?: XOR<MedicamentoCreateWithoutEmbalagensFracionadasInput, MedicamentoUncheckedCreateWithoutEmbalagensFracionadasInput>
    connectOrCreate?: MedicamentoCreateOrConnectWithoutEmbalagensFracionadasInput
    upsert?: MedicamentoUpsertWithoutEmbalagensFracionadasInput
    connect?: MedicamentoWhereUniqueInput
    update?: XOR<XOR<MedicamentoUpdateToOneWithWhereWithoutEmbalagensFracionadasInput, MedicamentoUpdateWithoutEmbalagensFracionadasInput>, MedicamentoUncheckedUpdateWithoutEmbalagensFracionadasInput>
  }

  export type DispensacaoItemUpdateManyWithoutEmbalagemNestedInput = {
    create?: XOR<DispensacaoItemCreateWithoutEmbalagemInput, DispensacaoItemUncheckedCreateWithoutEmbalagemInput> | DispensacaoItemCreateWithoutEmbalagemInput[] | DispensacaoItemUncheckedCreateWithoutEmbalagemInput[]
    connectOrCreate?: DispensacaoItemCreateOrConnectWithoutEmbalagemInput | DispensacaoItemCreateOrConnectWithoutEmbalagemInput[]
    upsert?: DispensacaoItemUpsertWithWhereUniqueWithoutEmbalagemInput | DispensacaoItemUpsertWithWhereUniqueWithoutEmbalagemInput[]
    createMany?: DispensacaoItemCreateManyEmbalagemInputEnvelope
    set?: DispensacaoItemWhereUniqueInput | DispensacaoItemWhereUniqueInput[]
    disconnect?: DispensacaoItemWhereUniqueInput | DispensacaoItemWhereUniqueInput[]
    delete?: DispensacaoItemWhereUniqueInput | DispensacaoItemWhereUniqueInput[]
    connect?: DispensacaoItemWhereUniqueInput | DispensacaoItemWhereUniqueInput[]
    update?: DispensacaoItemUpdateWithWhereUniqueWithoutEmbalagemInput | DispensacaoItemUpdateWithWhereUniqueWithoutEmbalagemInput[]
    updateMany?: DispensacaoItemUpdateManyWithWhereWithoutEmbalagemInput | DispensacaoItemUpdateManyWithWhereWithoutEmbalagemInput[]
    deleteMany?: DispensacaoItemScalarWhereInput | DispensacaoItemScalarWhereInput[]
  }

  export type MovimentacaoFracionadaUpdateManyWithoutEmbalagemNestedInput = {
    create?: XOR<MovimentacaoFracionadaCreateWithoutEmbalagemInput, MovimentacaoFracionadaUncheckedCreateWithoutEmbalagemInput> | MovimentacaoFracionadaCreateWithoutEmbalagemInput[] | MovimentacaoFracionadaUncheckedCreateWithoutEmbalagemInput[]
    connectOrCreate?: MovimentacaoFracionadaCreateOrConnectWithoutEmbalagemInput | MovimentacaoFracionadaCreateOrConnectWithoutEmbalagemInput[]
    upsert?: MovimentacaoFracionadaUpsertWithWhereUniqueWithoutEmbalagemInput | MovimentacaoFracionadaUpsertWithWhereUniqueWithoutEmbalagemInput[]
    createMany?: MovimentacaoFracionadaCreateManyEmbalagemInputEnvelope
    set?: MovimentacaoFracionadaWhereUniqueInput | MovimentacaoFracionadaWhereUniqueInput[]
    disconnect?: MovimentacaoFracionadaWhereUniqueInput | MovimentacaoFracionadaWhereUniqueInput[]
    delete?: MovimentacaoFracionadaWhereUniqueInput | MovimentacaoFracionadaWhereUniqueInput[]
    connect?: MovimentacaoFracionadaWhereUniqueInput | MovimentacaoFracionadaWhereUniqueInput[]
    update?: MovimentacaoFracionadaUpdateWithWhereUniqueWithoutEmbalagemInput | MovimentacaoFracionadaUpdateWithWhereUniqueWithoutEmbalagemInput[]
    updateMany?: MovimentacaoFracionadaUpdateManyWithWhereWithoutEmbalagemInput | MovimentacaoFracionadaUpdateManyWithWhereWithoutEmbalagemInput[]
    deleteMany?: MovimentacaoFracionadaScalarWhereInput | MovimentacaoFracionadaScalarWhereInput[]
  }

  export type DispensacaoItemUncheckedUpdateManyWithoutEmbalagemNestedInput = {
    create?: XOR<DispensacaoItemCreateWithoutEmbalagemInput, DispensacaoItemUncheckedCreateWithoutEmbalagemInput> | DispensacaoItemCreateWithoutEmbalagemInput[] | DispensacaoItemUncheckedCreateWithoutEmbalagemInput[]
    connectOrCreate?: DispensacaoItemCreateOrConnectWithoutEmbalagemInput | DispensacaoItemCreateOrConnectWithoutEmbalagemInput[]
    upsert?: DispensacaoItemUpsertWithWhereUniqueWithoutEmbalagemInput | DispensacaoItemUpsertWithWhereUniqueWithoutEmbalagemInput[]
    createMany?: DispensacaoItemCreateManyEmbalagemInputEnvelope
    set?: DispensacaoItemWhereUniqueInput | DispensacaoItemWhereUniqueInput[]
    disconnect?: DispensacaoItemWhereUniqueInput | DispensacaoItemWhereUniqueInput[]
    delete?: DispensacaoItemWhereUniqueInput | DispensacaoItemWhereUniqueInput[]
    connect?: DispensacaoItemWhereUniqueInput | DispensacaoItemWhereUniqueInput[]
    update?: DispensacaoItemUpdateWithWhereUniqueWithoutEmbalagemInput | DispensacaoItemUpdateWithWhereUniqueWithoutEmbalagemInput[]
    updateMany?: DispensacaoItemUpdateManyWithWhereWithoutEmbalagemInput | DispensacaoItemUpdateManyWithWhereWithoutEmbalagemInput[]
    deleteMany?: DispensacaoItemScalarWhereInput | DispensacaoItemScalarWhereInput[]
  }

  export type MovimentacaoFracionadaUncheckedUpdateManyWithoutEmbalagemNestedInput = {
    create?: XOR<MovimentacaoFracionadaCreateWithoutEmbalagemInput, MovimentacaoFracionadaUncheckedCreateWithoutEmbalagemInput> | MovimentacaoFracionadaCreateWithoutEmbalagemInput[] | MovimentacaoFracionadaUncheckedCreateWithoutEmbalagemInput[]
    connectOrCreate?: MovimentacaoFracionadaCreateOrConnectWithoutEmbalagemInput | MovimentacaoFracionadaCreateOrConnectWithoutEmbalagemInput[]
    upsert?: MovimentacaoFracionadaUpsertWithWhereUniqueWithoutEmbalagemInput | MovimentacaoFracionadaUpsertWithWhereUniqueWithoutEmbalagemInput[]
    createMany?: MovimentacaoFracionadaCreateManyEmbalagemInputEnvelope
    set?: MovimentacaoFracionadaWhereUniqueInput | MovimentacaoFracionadaWhereUniqueInput[]
    disconnect?: MovimentacaoFracionadaWhereUniqueInput | MovimentacaoFracionadaWhereUniqueInput[]
    delete?: MovimentacaoFracionadaWhereUniqueInput | MovimentacaoFracionadaWhereUniqueInput[]
    connect?: MovimentacaoFracionadaWhereUniqueInput | MovimentacaoFracionadaWhereUniqueInput[]
    update?: MovimentacaoFracionadaUpdateWithWhereUniqueWithoutEmbalagemInput | MovimentacaoFracionadaUpdateWithWhereUniqueWithoutEmbalagemInput[]
    updateMany?: MovimentacaoFracionadaUpdateManyWithWhereWithoutEmbalagemInput | MovimentacaoFracionadaUpdateManyWithWhereWithoutEmbalagemInput[]
    deleteMany?: MovimentacaoFracionadaScalarWhereInput | MovimentacaoFracionadaScalarWhereInput[]
  }

  export type EmbalageFracionadaCreateNestedOneWithoutMovimentacoesInput = {
    create?: XOR<EmbalageFracionadaCreateWithoutMovimentacoesInput, EmbalageFracionadaUncheckedCreateWithoutMovimentacoesInput>
    connectOrCreate?: EmbalageFracionadaCreateOrConnectWithoutMovimentacoesInput
    connect?: EmbalageFracionadaWhereUniqueInput
  }

  export type EmbalageFracionadaUpdateOneRequiredWithoutMovimentacoesNestedInput = {
    create?: XOR<EmbalageFracionadaCreateWithoutMovimentacoesInput, EmbalageFracionadaUncheckedCreateWithoutMovimentacoesInput>
    connectOrCreate?: EmbalageFracionadaCreateOrConnectWithoutMovimentacoesInput
    upsert?: EmbalageFracionadaUpsertWithoutMovimentacoesInput
    connect?: EmbalageFracionadaWhereUniqueInput
    update?: XOR<XOR<EmbalageFracionadaUpdateToOneWithWhereWithoutMovimentacoesInput, EmbalageFracionadaUpdateWithoutMovimentacoesInput>, EmbalageFracionadaUncheckedUpdateWithoutMovimentacoesInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type LoteCreateWithoutMedicamentoInput = {
    id?: string
    numeroLote: string
    quantidade: number
    quantidadeAtual: number
    quantidadeCaixasFechadas?: number
    quantidadePorCaixa?: number
    validade: Date | string
    fornecedor?: string | null
    notaFiscal?: string | null
    criadoEm?: Date | string
    deletedAt?: Date | string | null
    dispensacaoItens?: DispensacaoItemCreateNestedManyWithoutLoteInput
    embalagensFracionadas?: EmbalageFracionadaCreateNestedManyWithoutLoteInput
  }

  export type LoteUncheckedCreateWithoutMedicamentoInput = {
    id?: string
    numeroLote: string
    quantidade: number
    quantidadeAtual: number
    quantidadeCaixasFechadas?: number
    quantidadePorCaixa?: number
    validade: Date | string
    fornecedor?: string | null
    notaFiscal?: string | null
    criadoEm?: Date | string
    deletedAt?: Date | string | null
    dispensacaoItens?: DispensacaoItemUncheckedCreateNestedManyWithoutLoteInput
    embalagensFracionadas?: EmbalageFracionadaUncheckedCreateNestedManyWithoutLoteInput
  }

  export type LoteCreateOrConnectWithoutMedicamentoInput = {
    where: LoteWhereUniqueInput
    create: XOR<LoteCreateWithoutMedicamentoInput, LoteUncheckedCreateWithoutMedicamentoInput>
  }

  export type LoteCreateManyMedicamentoInputEnvelope = {
    data: LoteCreateManyMedicamentoInput | LoteCreateManyMedicamentoInput[]
    skipDuplicates?: boolean
  }

  export type DispensacaoItemCreateWithoutMedicamentoInput = {
    id?: string
    quantidade: number
    criadoEm?: Date | string
    dispensacao: DispensacaoCreateNestedOneWithoutItensInput
    lote?: LoteCreateNestedOneWithoutDispensacaoItensInput
    embalagem?: EmbalageFracionadaCreateNestedOneWithoutDispensacaoItensInput
  }

  export type DispensacaoItemUncheckedCreateWithoutMedicamentoInput = {
    id?: string
    dispensacaoId: string
    loteId?: string | null
    embalagemFracionadaId?: string | null
    quantidade: number
    criadoEm?: Date | string
  }

  export type DispensacaoItemCreateOrConnectWithoutMedicamentoInput = {
    where: DispensacaoItemWhereUniqueInput
    create: XOR<DispensacaoItemCreateWithoutMedicamentoInput, DispensacaoItemUncheckedCreateWithoutMedicamentoInput>
  }

  export type DispensacaoItemCreateManyMedicamentoInputEnvelope = {
    data: DispensacaoItemCreateManyMedicamentoInput | DispensacaoItemCreateManyMedicamentoInput[]
    skipDuplicates?: boolean
  }

  export type EmbalageFracionadaCreateWithoutMedicamentoInput = {
    id?: string
    codigoQr: string
    quantidadeAtual: number
    status?: string
    criadoEm?: Date | string
    atualizadoEm?: Date | string
    criadoPor: string
    lote: LoteCreateNestedOneWithoutEmbalagensFracionadasInput
    dispensacaoItens?: DispensacaoItemCreateNestedManyWithoutEmbalagemInput
    movimentacoes?: MovimentacaoFracionadaCreateNestedManyWithoutEmbalagemInput
  }

  export type EmbalageFracionadaUncheckedCreateWithoutMedicamentoInput = {
    id?: string
    loteId: string
    codigoQr: string
    quantidadeAtual: number
    status?: string
    criadoEm?: Date | string
    atualizadoEm?: Date | string
    criadoPor: string
    dispensacaoItens?: DispensacaoItemUncheckedCreateNestedManyWithoutEmbalagemInput
    movimentacoes?: MovimentacaoFracionadaUncheckedCreateNestedManyWithoutEmbalagemInput
  }

  export type EmbalageFracionadaCreateOrConnectWithoutMedicamentoInput = {
    where: EmbalageFracionadaWhereUniqueInput
    create: XOR<EmbalageFracionadaCreateWithoutMedicamentoInput, EmbalageFracionadaUncheckedCreateWithoutMedicamentoInput>
  }

  export type EmbalageFracionadaCreateManyMedicamentoInputEnvelope = {
    data: EmbalageFracionadaCreateManyMedicamentoInput | EmbalageFracionadaCreateManyMedicamentoInput[]
    skipDuplicates?: boolean
  }

  export type LoteUpsertWithWhereUniqueWithoutMedicamentoInput = {
    where: LoteWhereUniqueInput
    update: XOR<LoteUpdateWithoutMedicamentoInput, LoteUncheckedUpdateWithoutMedicamentoInput>
    create: XOR<LoteCreateWithoutMedicamentoInput, LoteUncheckedCreateWithoutMedicamentoInput>
  }

  export type LoteUpdateWithWhereUniqueWithoutMedicamentoInput = {
    where: LoteWhereUniqueInput
    data: XOR<LoteUpdateWithoutMedicamentoInput, LoteUncheckedUpdateWithoutMedicamentoInput>
  }

  export type LoteUpdateManyWithWhereWithoutMedicamentoInput = {
    where: LoteScalarWhereInput
    data: XOR<LoteUpdateManyMutationInput, LoteUncheckedUpdateManyWithoutMedicamentoInput>
  }

  export type LoteScalarWhereInput = {
    AND?: LoteScalarWhereInput | LoteScalarWhereInput[]
    OR?: LoteScalarWhereInput[]
    NOT?: LoteScalarWhereInput | LoteScalarWhereInput[]
    id?: StringFilter<"Lote"> | string
    medicamentoId?: StringFilter<"Lote"> | string
    numeroLote?: StringFilter<"Lote"> | string
    quantidade?: IntFilter<"Lote"> | number
    quantidadeAtual?: IntFilter<"Lote"> | number
    quantidadeCaixasFechadas?: IntFilter<"Lote"> | number
    quantidadePorCaixa?: IntFilter<"Lote"> | number
    validade?: DateTimeFilter<"Lote"> | Date | string
    fornecedor?: StringNullableFilter<"Lote"> | string | null
    notaFiscal?: StringNullableFilter<"Lote"> | string | null
    criadoEm?: DateTimeFilter<"Lote"> | Date | string
    deletedAt?: DateTimeNullableFilter<"Lote"> | Date | string | null
  }

  export type DispensacaoItemUpsertWithWhereUniqueWithoutMedicamentoInput = {
    where: DispensacaoItemWhereUniqueInput
    update: XOR<DispensacaoItemUpdateWithoutMedicamentoInput, DispensacaoItemUncheckedUpdateWithoutMedicamentoInput>
    create: XOR<DispensacaoItemCreateWithoutMedicamentoInput, DispensacaoItemUncheckedCreateWithoutMedicamentoInput>
  }

  export type DispensacaoItemUpdateWithWhereUniqueWithoutMedicamentoInput = {
    where: DispensacaoItemWhereUniqueInput
    data: XOR<DispensacaoItemUpdateWithoutMedicamentoInput, DispensacaoItemUncheckedUpdateWithoutMedicamentoInput>
  }

  export type DispensacaoItemUpdateManyWithWhereWithoutMedicamentoInput = {
    where: DispensacaoItemScalarWhereInput
    data: XOR<DispensacaoItemUpdateManyMutationInput, DispensacaoItemUncheckedUpdateManyWithoutMedicamentoInput>
  }

  export type DispensacaoItemScalarWhereInput = {
    AND?: DispensacaoItemScalarWhereInput | DispensacaoItemScalarWhereInput[]
    OR?: DispensacaoItemScalarWhereInput[]
    NOT?: DispensacaoItemScalarWhereInput | DispensacaoItemScalarWhereInput[]
    id?: StringFilter<"DispensacaoItem"> | string
    dispensacaoId?: StringFilter<"DispensacaoItem"> | string
    medicamentoId?: StringFilter<"DispensacaoItem"> | string
    loteId?: StringNullableFilter<"DispensacaoItem"> | string | null
    embalagemFracionadaId?: StringNullableFilter<"DispensacaoItem"> | string | null
    quantidade?: IntFilter<"DispensacaoItem"> | number
    criadoEm?: DateTimeFilter<"DispensacaoItem"> | Date | string
  }

  export type EmbalageFracionadaUpsertWithWhereUniqueWithoutMedicamentoInput = {
    where: EmbalageFracionadaWhereUniqueInput
    update: XOR<EmbalageFracionadaUpdateWithoutMedicamentoInput, EmbalageFracionadaUncheckedUpdateWithoutMedicamentoInput>
    create: XOR<EmbalageFracionadaCreateWithoutMedicamentoInput, EmbalageFracionadaUncheckedCreateWithoutMedicamentoInput>
  }

  export type EmbalageFracionadaUpdateWithWhereUniqueWithoutMedicamentoInput = {
    where: EmbalageFracionadaWhereUniqueInput
    data: XOR<EmbalageFracionadaUpdateWithoutMedicamentoInput, EmbalageFracionadaUncheckedUpdateWithoutMedicamentoInput>
  }

  export type EmbalageFracionadaUpdateManyWithWhereWithoutMedicamentoInput = {
    where: EmbalageFracionadaScalarWhereInput
    data: XOR<EmbalageFracionadaUpdateManyMutationInput, EmbalageFracionadaUncheckedUpdateManyWithoutMedicamentoInput>
  }

  export type EmbalageFracionadaScalarWhereInput = {
    AND?: EmbalageFracionadaScalarWhereInput | EmbalageFracionadaScalarWhereInput[]
    OR?: EmbalageFracionadaScalarWhereInput[]
    NOT?: EmbalageFracionadaScalarWhereInput | EmbalageFracionadaScalarWhereInput[]
    id?: StringFilter<"EmbalageFracionada"> | string
    loteId?: StringFilter<"EmbalageFracionada"> | string
    medicamentoId?: StringFilter<"EmbalageFracionada"> | string
    codigoQr?: StringFilter<"EmbalageFracionada"> | string
    quantidadeAtual?: IntFilter<"EmbalageFracionada"> | number
    status?: StringFilter<"EmbalageFracionada"> | string
    criadoEm?: DateTimeFilter<"EmbalageFracionada"> | Date | string
    atualizadoEm?: DateTimeFilter<"EmbalageFracionada"> | Date | string
    criadoPor?: StringFilter<"EmbalageFracionada"> | string
  }

  export type MedicamentoCreateWithoutLotesInput = {
    id?: string
    catmatCodigo?: string | null
    nome: string
    principioAtivo?: string | null
    formaFarmaceutica?: string | null
    concentracao?: string | null
    unidadeMedida?: string
    quantidadePorEmbalagem?: number
    estoqueMinimo?: number
    criadoEm?: Date | string
    atualizadoEm?: Date | string
    deletedAt?: Date | string | null
    dispensacaoItens?: DispensacaoItemCreateNestedManyWithoutMedicamentoInput
    embalagensFracionadas?: EmbalageFracionadaCreateNestedManyWithoutMedicamentoInput
  }

  export type MedicamentoUncheckedCreateWithoutLotesInput = {
    id?: string
    catmatCodigo?: string | null
    nome: string
    principioAtivo?: string | null
    formaFarmaceutica?: string | null
    concentracao?: string | null
    unidadeMedida?: string
    quantidadePorEmbalagem?: number
    estoqueMinimo?: number
    criadoEm?: Date | string
    atualizadoEm?: Date | string
    deletedAt?: Date | string | null
    dispensacaoItens?: DispensacaoItemUncheckedCreateNestedManyWithoutMedicamentoInput
    embalagensFracionadas?: EmbalageFracionadaUncheckedCreateNestedManyWithoutMedicamentoInput
  }

  export type MedicamentoCreateOrConnectWithoutLotesInput = {
    where: MedicamentoWhereUniqueInput
    create: XOR<MedicamentoCreateWithoutLotesInput, MedicamentoUncheckedCreateWithoutLotesInput>
  }

  export type DispensacaoItemCreateWithoutLoteInput = {
    id?: string
    quantidade: number
    criadoEm?: Date | string
    dispensacao: DispensacaoCreateNestedOneWithoutItensInput
    medicamento: MedicamentoCreateNestedOneWithoutDispensacaoItensInput
    embalagem?: EmbalageFracionadaCreateNestedOneWithoutDispensacaoItensInput
  }

  export type DispensacaoItemUncheckedCreateWithoutLoteInput = {
    id?: string
    dispensacaoId: string
    medicamentoId: string
    embalagemFracionadaId?: string | null
    quantidade: number
    criadoEm?: Date | string
  }

  export type DispensacaoItemCreateOrConnectWithoutLoteInput = {
    where: DispensacaoItemWhereUniqueInput
    create: XOR<DispensacaoItemCreateWithoutLoteInput, DispensacaoItemUncheckedCreateWithoutLoteInput>
  }

  export type DispensacaoItemCreateManyLoteInputEnvelope = {
    data: DispensacaoItemCreateManyLoteInput | DispensacaoItemCreateManyLoteInput[]
    skipDuplicates?: boolean
  }

  export type EmbalageFracionadaCreateWithoutLoteInput = {
    id?: string
    codigoQr: string
    quantidadeAtual: number
    status?: string
    criadoEm?: Date | string
    atualizadoEm?: Date | string
    criadoPor: string
    medicamento: MedicamentoCreateNestedOneWithoutEmbalagensFracionadasInput
    dispensacaoItens?: DispensacaoItemCreateNestedManyWithoutEmbalagemInput
    movimentacoes?: MovimentacaoFracionadaCreateNestedManyWithoutEmbalagemInput
  }

  export type EmbalageFracionadaUncheckedCreateWithoutLoteInput = {
    id?: string
    medicamentoId: string
    codigoQr: string
    quantidadeAtual: number
    status?: string
    criadoEm?: Date | string
    atualizadoEm?: Date | string
    criadoPor: string
    dispensacaoItens?: DispensacaoItemUncheckedCreateNestedManyWithoutEmbalagemInput
    movimentacoes?: MovimentacaoFracionadaUncheckedCreateNestedManyWithoutEmbalagemInput
  }

  export type EmbalageFracionadaCreateOrConnectWithoutLoteInput = {
    where: EmbalageFracionadaWhereUniqueInput
    create: XOR<EmbalageFracionadaCreateWithoutLoteInput, EmbalageFracionadaUncheckedCreateWithoutLoteInput>
  }

  export type EmbalageFracionadaCreateManyLoteInputEnvelope = {
    data: EmbalageFracionadaCreateManyLoteInput | EmbalageFracionadaCreateManyLoteInput[]
    skipDuplicates?: boolean
  }

  export type MedicamentoUpsertWithoutLotesInput = {
    update: XOR<MedicamentoUpdateWithoutLotesInput, MedicamentoUncheckedUpdateWithoutLotesInput>
    create: XOR<MedicamentoCreateWithoutLotesInput, MedicamentoUncheckedCreateWithoutLotesInput>
    where?: MedicamentoWhereInput
  }

  export type MedicamentoUpdateToOneWithWhereWithoutLotesInput = {
    where?: MedicamentoWhereInput
    data: XOR<MedicamentoUpdateWithoutLotesInput, MedicamentoUncheckedUpdateWithoutLotesInput>
  }

  export type MedicamentoUpdateWithoutLotesInput = {
    id?: StringFieldUpdateOperationsInput | string
    catmatCodigo?: NullableStringFieldUpdateOperationsInput | string | null
    nome?: StringFieldUpdateOperationsInput | string
    principioAtivo?: NullableStringFieldUpdateOperationsInput | string | null
    formaFarmaceutica?: NullableStringFieldUpdateOperationsInput | string | null
    concentracao?: NullableStringFieldUpdateOperationsInput | string | null
    unidadeMedida?: StringFieldUpdateOperationsInput | string
    quantidadePorEmbalagem?: IntFieldUpdateOperationsInput | number
    estoqueMinimo?: IntFieldUpdateOperationsInput | number
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    dispensacaoItens?: DispensacaoItemUpdateManyWithoutMedicamentoNestedInput
    embalagensFracionadas?: EmbalageFracionadaUpdateManyWithoutMedicamentoNestedInput
  }

  export type MedicamentoUncheckedUpdateWithoutLotesInput = {
    id?: StringFieldUpdateOperationsInput | string
    catmatCodigo?: NullableStringFieldUpdateOperationsInput | string | null
    nome?: StringFieldUpdateOperationsInput | string
    principioAtivo?: NullableStringFieldUpdateOperationsInput | string | null
    formaFarmaceutica?: NullableStringFieldUpdateOperationsInput | string | null
    concentracao?: NullableStringFieldUpdateOperationsInput | string | null
    unidadeMedida?: StringFieldUpdateOperationsInput | string
    quantidadePorEmbalagem?: IntFieldUpdateOperationsInput | number
    estoqueMinimo?: IntFieldUpdateOperationsInput | number
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    dispensacaoItens?: DispensacaoItemUncheckedUpdateManyWithoutMedicamentoNestedInput
    embalagensFracionadas?: EmbalageFracionadaUncheckedUpdateManyWithoutMedicamentoNestedInput
  }

  export type DispensacaoItemUpsertWithWhereUniqueWithoutLoteInput = {
    where: DispensacaoItemWhereUniqueInput
    update: XOR<DispensacaoItemUpdateWithoutLoteInput, DispensacaoItemUncheckedUpdateWithoutLoteInput>
    create: XOR<DispensacaoItemCreateWithoutLoteInput, DispensacaoItemUncheckedCreateWithoutLoteInput>
  }

  export type DispensacaoItemUpdateWithWhereUniqueWithoutLoteInput = {
    where: DispensacaoItemWhereUniqueInput
    data: XOR<DispensacaoItemUpdateWithoutLoteInput, DispensacaoItemUncheckedUpdateWithoutLoteInput>
  }

  export type DispensacaoItemUpdateManyWithWhereWithoutLoteInput = {
    where: DispensacaoItemScalarWhereInput
    data: XOR<DispensacaoItemUpdateManyMutationInput, DispensacaoItemUncheckedUpdateManyWithoutLoteInput>
  }

  export type EmbalageFracionadaUpsertWithWhereUniqueWithoutLoteInput = {
    where: EmbalageFracionadaWhereUniqueInput
    update: XOR<EmbalageFracionadaUpdateWithoutLoteInput, EmbalageFracionadaUncheckedUpdateWithoutLoteInput>
    create: XOR<EmbalageFracionadaCreateWithoutLoteInput, EmbalageFracionadaUncheckedCreateWithoutLoteInput>
  }

  export type EmbalageFracionadaUpdateWithWhereUniqueWithoutLoteInput = {
    where: EmbalageFracionadaWhereUniqueInput
    data: XOR<EmbalageFracionadaUpdateWithoutLoteInput, EmbalageFracionadaUncheckedUpdateWithoutLoteInput>
  }

  export type EmbalageFracionadaUpdateManyWithWhereWithoutLoteInput = {
    where: EmbalageFracionadaScalarWhereInput
    data: XOR<EmbalageFracionadaUpdateManyMutationInput, EmbalageFracionadaUncheckedUpdateManyWithoutLoteInput>
  }

  export type PrescricaoCreateWithoutPacienteInput = {
    id?: string
    medicoNome?: string | null
    crm?: string | null
    dataEmissao: Date | string
    dataValidade?: Date | string | null
    numeroReceita?: string | null
    arquivoUrl?: string | null
    observacoes?: string | null
    criadoEm?: Date | string
    deletedAt?: Date | string | null
    dispensacoes?: DispensacaoCreateNestedManyWithoutPrescricaoInput
  }

  export type PrescricaoUncheckedCreateWithoutPacienteInput = {
    id?: string
    medicoNome?: string | null
    crm?: string | null
    dataEmissao: Date | string
    dataValidade?: Date | string | null
    numeroReceita?: string | null
    arquivoUrl?: string | null
    observacoes?: string | null
    criadoEm?: Date | string
    deletedAt?: Date | string | null
    dispensacoes?: DispensacaoUncheckedCreateNestedManyWithoutPrescricaoInput
  }

  export type PrescricaoCreateOrConnectWithoutPacienteInput = {
    where: PrescricaoWhereUniqueInput
    create: XOR<PrescricaoCreateWithoutPacienteInput, PrescricaoUncheckedCreateWithoutPacienteInput>
  }

  export type PrescricaoCreateManyPacienteInputEnvelope = {
    data: PrescricaoCreateManyPacienteInput | PrescricaoCreateManyPacienteInput[]
    skipDuplicates?: boolean
  }

  export type DispensacaoCreateWithoutPacienteInput = {
    id?: string
    usuarioId: string
    dataDispensacao?: Date | string
    observacoes?: string | null
    criadoEm?: Date | string
    prescricao?: PrescricaoCreateNestedOneWithoutDispensacoesInput
    itens?: DispensacaoItemCreateNestedManyWithoutDispensacaoInput
  }

  export type DispensacaoUncheckedCreateWithoutPacienteInput = {
    id?: string
    prescricaoId?: string | null
    usuarioId: string
    dataDispensacao?: Date | string
    observacoes?: string | null
    criadoEm?: Date | string
    itens?: DispensacaoItemUncheckedCreateNestedManyWithoutDispensacaoInput
  }

  export type DispensacaoCreateOrConnectWithoutPacienteInput = {
    where: DispensacaoWhereUniqueInput
    create: XOR<DispensacaoCreateWithoutPacienteInput, DispensacaoUncheckedCreateWithoutPacienteInput>
  }

  export type DispensacaoCreateManyPacienteInputEnvelope = {
    data: DispensacaoCreateManyPacienteInput | DispensacaoCreateManyPacienteInput[]
    skipDuplicates?: boolean
  }

  export type PrescricaoUpsertWithWhereUniqueWithoutPacienteInput = {
    where: PrescricaoWhereUniqueInput
    update: XOR<PrescricaoUpdateWithoutPacienteInput, PrescricaoUncheckedUpdateWithoutPacienteInput>
    create: XOR<PrescricaoCreateWithoutPacienteInput, PrescricaoUncheckedCreateWithoutPacienteInput>
  }

  export type PrescricaoUpdateWithWhereUniqueWithoutPacienteInput = {
    where: PrescricaoWhereUniqueInput
    data: XOR<PrescricaoUpdateWithoutPacienteInput, PrescricaoUncheckedUpdateWithoutPacienteInput>
  }

  export type PrescricaoUpdateManyWithWhereWithoutPacienteInput = {
    where: PrescricaoScalarWhereInput
    data: XOR<PrescricaoUpdateManyMutationInput, PrescricaoUncheckedUpdateManyWithoutPacienteInput>
  }

  export type PrescricaoScalarWhereInput = {
    AND?: PrescricaoScalarWhereInput | PrescricaoScalarWhereInput[]
    OR?: PrescricaoScalarWhereInput[]
    NOT?: PrescricaoScalarWhereInput | PrescricaoScalarWhereInput[]
    id?: StringFilter<"Prescricao"> | string
    pacienteId?: StringFilter<"Prescricao"> | string
    medicoNome?: StringNullableFilter<"Prescricao"> | string | null
    crm?: StringNullableFilter<"Prescricao"> | string | null
    dataEmissao?: DateTimeFilter<"Prescricao"> | Date | string
    dataValidade?: DateTimeNullableFilter<"Prescricao"> | Date | string | null
    numeroReceita?: StringNullableFilter<"Prescricao"> | string | null
    arquivoUrl?: StringNullableFilter<"Prescricao"> | string | null
    observacoes?: StringNullableFilter<"Prescricao"> | string | null
    criadoEm?: DateTimeFilter<"Prescricao"> | Date | string
    deletedAt?: DateTimeNullableFilter<"Prescricao"> | Date | string | null
  }

  export type DispensacaoUpsertWithWhereUniqueWithoutPacienteInput = {
    where: DispensacaoWhereUniqueInput
    update: XOR<DispensacaoUpdateWithoutPacienteInput, DispensacaoUncheckedUpdateWithoutPacienteInput>
    create: XOR<DispensacaoCreateWithoutPacienteInput, DispensacaoUncheckedCreateWithoutPacienteInput>
  }

  export type DispensacaoUpdateWithWhereUniqueWithoutPacienteInput = {
    where: DispensacaoWhereUniqueInput
    data: XOR<DispensacaoUpdateWithoutPacienteInput, DispensacaoUncheckedUpdateWithoutPacienteInput>
  }

  export type DispensacaoUpdateManyWithWhereWithoutPacienteInput = {
    where: DispensacaoScalarWhereInput
    data: XOR<DispensacaoUpdateManyMutationInput, DispensacaoUncheckedUpdateManyWithoutPacienteInput>
  }

  export type DispensacaoScalarWhereInput = {
    AND?: DispensacaoScalarWhereInput | DispensacaoScalarWhereInput[]
    OR?: DispensacaoScalarWhereInput[]
    NOT?: DispensacaoScalarWhereInput | DispensacaoScalarWhereInput[]
    id?: StringFilter<"Dispensacao"> | string
    pacienteId?: StringFilter<"Dispensacao"> | string
    prescricaoId?: StringNullableFilter<"Dispensacao"> | string | null
    usuarioId?: StringFilter<"Dispensacao"> | string
    dataDispensacao?: DateTimeFilter<"Dispensacao"> | Date | string
    observacoes?: StringNullableFilter<"Dispensacao"> | string | null
    criadoEm?: DateTimeFilter<"Dispensacao"> | Date | string
  }

  export type PacienteCreateWithoutPrescricoesInput = {
    id?: string
    nome: string
    cpf?: string | null
    cartaoSus?: string | null
    dataNasc?: Date | string | null
    telefone?: string | null
    endereco?: string | null
    criadoEm?: Date | string
    atualizadoEm?: Date | string
    deletedAt?: Date | string | null
    dispensacoes?: DispensacaoCreateNestedManyWithoutPacienteInput
  }

  export type PacienteUncheckedCreateWithoutPrescricoesInput = {
    id?: string
    nome: string
    cpf?: string | null
    cartaoSus?: string | null
    dataNasc?: Date | string | null
    telefone?: string | null
    endereco?: string | null
    criadoEm?: Date | string
    atualizadoEm?: Date | string
    deletedAt?: Date | string | null
    dispensacoes?: DispensacaoUncheckedCreateNestedManyWithoutPacienteInput
  }

  export type PacienteCreateOrConnectWithoutPrescricoesInput = {
    where: PacienteWhereUniqueInput
    create: XOR<PacienteCreateWithoutPrescricoesInput, PacienteUncheckedCreateWithoutPrescricoesInput>
  }

  export type DispensacaoCreateWithoutPrescricaoInput = {
    id?: string
    usuarioId: string
    dataDispensacao?: Date | string
    observacoes?: string | null
    criadoEm?: Date | string
    paciente: PacienteCreateNestedOneWithoutDispensacoesInput
    itens?: DispensacaoItemCreateNestedManyWithoutDispensacaoInput
  }

  export type DispensacaoUncheckedCreateWithoutPrescricaoInput = {
    id?: string
    pacienteId: string
    usuarioId: string
    dataDispensacao?: Date | string
    observacoes?: string | null
    criadoEm?: Date | string
    itens?: DispensacaoItemUncheckedCreateNestedManyWithoutDispensacaoInput
  }

  export type DispensacaoCreateOrConnectWithoutPrescricaoInput = {
    where: DispensacaoWhereUniqueInput
    create: XOR<DispensacaoCreateWithoutPrescricaoInput, DispensacaoUncheckedCreateWithoutPrescricaoInput>
  }

  export type DispensacaoCreateManyPrescricaoInputEnvelope = {
    data: DispensacaoCreateManyPrescricaoInput | DispensacaoCreateManyPrescricaoInput[]
    skipDuplicates?: boolean
  }

  export type PacienteUpsertWithoutPrescricoesInput = {
    update: XOR<PacienteUpdateWithoutPrescricoesInput, PacienteUncheckedUpdateWithoutPrescricoesInput>
    create: XOR<PacienteCreateWithoutPrescricoesInput, PacienteUncheckedCreateWithoutPrescricoesInput>
    where?: PacienteWhereInput
  }

  export type PacienteUpdateToOneWithWhereWithoutPrescricoesInput = {
    where?: PacienteWhereInput
    data: XOR<PacienteUpdateWithoutPrescricoesInput, PacienteUncheckedUpdateWithoutPrescricoesInput>
  }

  export type PacienteUpdateWithoutPrescricoesInput = {
    id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    cpf?: NullableStringFieldUpdateOperationsInput | string | null
    cartaoSus?: NullableStringFieldUpdateOperationsInput | string | null
    dataNasc?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    telefone?: NullableStringFieldUpdateOperationsInput | string | null
    endereco?: NullableStringFieldUpdateOperationsInput | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    dispensacoes?: DispensacaoUpdateManyWithoutPacienteNestedInput
  }

  export type PacienteUncheckedUpdateWithoutPrescricoesInput = {
    id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    cpf?: NullableStringFieldUpdateOperationsInput | string | null
    cartaoSus?: NullableStringFieldUpdateOperationsInput | string | null
    dataNasc?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    telefone?: NullableStringFieldUpdateOperationsInput | string | null
    endereco?: NullableStringFieldUpdateOperationsInput | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    dispensacoes?: DispensacaoUncheckedUpdateManyWithoutPacienteNestedInput
  }

  export type DispensacaoUpsertWithWhereUniqueWithoutPrescricaoInput = {
    where: DispensacaoWhereUniqueInput
    update: XOR<DispensacaoUpdateWithoutPrescricaoInput, DispensacaoUncheckedUpdateWithoutPrescricaoInput>
    create: XOR<DispensacaoCreateWithoutPrescricaoInput, DispensacaoUncheckedCreateWithoutPrescricaoInput>
  }

  export type DispensacaoUpdateWithWhereUniqueWithoutPrescricaoInput = {
    where: DispensacaoWhereUniqueInput
    data: XOR<DispensacaoUpdateWithoutPrescricaoInput, DispensacaoUncheckedUpdateWithoutPrescricaoInput>
  }

  export type DispensacaoUpdateManyWithWhereWithoutPrescricaoInput = {
    where: DispensacaoScalarWhereInput
    data: XOR<DispensacaoUpdateManyMutationInput, DispensacaoUncheckedUpdateManyWithoutPrescricaoInput>
  }

  export type PacienteCreateWithoutDispensacoesInput = {
    id?: string
    nome: string
    cpf?: string | null
    cartaoSus?: string | null
    dataNasc?: Date | string | null
    telefone?: string | null
    endereco?: string | null
    criadoEm?: Date | string
    atualizadoEm?: Date | string
    deletedAt?: Date | string | null
    prescricoes?: PrescricaoCreateNestedManyWithoutPacienteInput
  }

  export type PacienteUncheckedCreateWithoutDispensacoesInput = {
    id?: string
    nome: string
    cpf?: string | null
    cartaoSus?: string | null
    dataNasc?: Date | string | null
    telefone?: string | null
    endereco?: string | null
    criadoEm?: Date | string
    atualizadoEm?: Date | string
    deletedAt?: Date | string | null
    prescricoes?: PrescricaoUncheckedCreateNestedManyWithoutPacienteInput
  }

  export type PacienteCreateOrConnectWithoutDispensacoesInput = {
    where: PacienteWhereUniqueInput
    create: XOR<PacienteCreateWithoutDispensacoesInput, PacienteUncheckedCreateWithoutDispensacoesInput>
  }

  export type PrescricaoCreateWithoutDispensacoesInput = {
    id?: string
    medicoNome?: string | null
    crm?: string | null
    dataEmissao: Date | string
    dataValidade?: Date | string | null
    numeroReceita?: string | null
    arquivoUrl?: string | null
    observacoes?: string | null
    criadoEm?: Date | string
    deletedAt?: Date | string | null
    paciente: PacienteCreateNestedOneWithoutPrescricoesInput
  }

  export type PrescricaoUncheckedCreateWithoutDispensacoesInput = {
    id?: string
    pacienteId: string
    medicoNome?: string | null
    crm?: string | null
    dataEmissao: Date | string
    dataValidade?: Date | string | null
    numeroReceita?: string | null
    arquivoUrl?: string | null
    observacoes?: string | null
    criadoEm?: Date | string
    deletedAt?: Date | string | null
  }

  export type PrescricaoCreateOrConnectWithoutDispensacoesInput = {
    where: PrescricaoWhereUniqueInput
    create: XOR<PrescricaoCreateWithoutDispensacoesInput, PrescricaoUncheckedCreateWithoutDispensacoesInput>
  }

  export type DispensacaoItemCreateWithoutDispensacaoInput = {
    id?: string
    quantidade: number
    criadoEm?: Date | string
    medicamento: MedicamentoCreateNestedOneWithoutDispensacaoItensInput
    lote?: LoteCreateNestedOneWithoutDispensacaoItensInput
    embalagem?: EmbalageFracionadaCreateNestedOneWithoutDispensacaoItensInput
  }

  export type DispensacaoItemUncheckedCreateWithoutDispensacaoInput = {
    id?: string
    medicamentoId: string
    loteId?: string | null
    embalagemFracionadaId?: string | null
    quantidade: number
    criadoEm?: Date | string
  }

  export type DispensacaoItemCreateOrConnectWithoutDispensacaoInput = {
    where: DispensacaoItemWhereUniqueInput
    create: XOR<DispensacaoItemCreateWithoutDispensacaoInput, DispensacaoItemUncheckedCreateWithoutDispensacaoInput>
  }

  export type DispensacaoItemCreateManyDispensacaoInputEnvelope = {
    data: DispensacaoItemCreateManyDispensacaoInput | DispensacaoItemCreateManyDispensacaoInput[]
    skipDuplicates?: boolean
  }

  export type PacienteUpsertWithoutDispensacoesInput = {
    update: XOR<PacienteUpdateWithoutDispensacoesInput, PacienteUncheckedUpdateWithoutDispensacoesInput>
    create: XOR<PacienteCreateWithoutDispensacoesInput, PacienteUncheckedCreateWithoutDispensacoesInput>
    where?: PacienteWhereInput
  }

  export type PacienteUpdateToOneWithWhereWithoutDispensacoesInput = {
    where?: PacienteWhereInput
    data: XOR<PacienteUpdateWithoutDispensacoesInput, PacienteUncheckedUpdateWithoutDispensacoesInput>
  }

  export type PacienteUpdateWithoutDispensacoesInput = {
    id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    cpf?: NullableStringFieldUpdateOperationsInput | string | null
    cartaoSus?: NullableStringFieldUpdateOperationsInput | string | null
    dataNasc?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    telefone?: NullableStringFieldUpdateOperationsInput | string | null
    endereco?: NullableStringFieldUpdateOperationsInput | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    prescricoes?: PrescricaoUpdateManyWithoutPacienteNestedInput
  }

  export type PacienteUncheckedUpdateWithoutDispensacoesInput = {
    id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    cpf?: NullableStringFieldUpdateOperationsInput | string | null
    cartaoSus?: NullableStringFieldUpdateOperationsInput | string | null
    dataNasc?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    telefone?: NullableStringFieldUpdateOperationsInput | string | null
    endereco?: NullableStringFieldUpdateOperationsInput | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    prescricoes?: PrescricaoUncheckedUpdateManyWithoutPacienteNestedInput
  }

  export type PrescricaoUpsertWithoutDispensacoesInput = {
    update: XOR<PrescricaoUpdateWithoutDispensacoesInput, PrescricaoUncheckedUpdateWithoutDispensacoesInput>
    create: XOR<PrescricaoCreateWithoutDispensacoesInput, PrescricaoUncheckedCreateWithoutDispensacoesInput>
    where?: PrescricaoWhereInput
  }

  export type PrescricaoUpdateToOneWithWhereWithoutDispensacoesInput = {
    where?: PrescricaoWhereInput
    data: XOR<PrescricaoUpdateWithoutDispensacoesInput, PrescricaoUncheckedUpdateWithoutDispensacoesInput>
  }

  export type PrescricaoUpdateWithoutDispensacoesInput = {
    id?: StringFieldUpdateOperationsInput | string
    medicoNome?: NullableStringFieldUpdateOperationsInput | string | null
    crm?: NullableStringFieldUpdateOperationsInput | string | null
    dataEmissao?: DateTimeFieldUpdateOperationsInput | Date | string
    dataValidade?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    numeroReceita?: NullableStringFieldUpdateOperationsInput | string | null
    arquivoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    observacoes?: NullableStringFieldUpdateOperationsInput | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    paciente?: PacienteUpdateOneRequiredWithoutPrescricoesNestedInput
  }

  export type PrescricaoUncheckedUpdateWithoutDispensacoesInput = {
    id?: StringFieldUpdateOperationsInput | string
    pacienteId?: StringFieldUpdateOperationsInput | string
    medicoNome?: NullableStringFieldUpdateOperationsInput | string | null
    crm?: NullableStringFieldUpdateOperationsInput | string | null
    dataEmissao?: DateTimeFieldUpdateOperationsInput | Date | string
    dataValidade?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    numeroReceita?: NullableStringFieldUpdateOperationsInput | string | null
    arquivoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    observacoes?: NullableStringFieldUpdateOperationsInput | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type DispensacaoItemUpsertWithWhereUniqueWithoutDispensacaoInput = {
    where: DispensacaoItemWhereUniqueInput
    update: XOR<DispensacaoItemUpdateWithoutDispensacaoInput, DispensacaoItemUncheckedUpdateWithoutDispensacaoInput>
    create: XOR<DispensacaoItemCreateWithoutDispensacaoInput, DispensacaoItemUncheckedCreateWithoutDispensacaoInput>
  }

  export type DispensacaoItemUpdateWithWhereUniqueWithoutDispensacaoInput = {
    where: DispensacaoItemWhereUniqueInput
    data: XOR<DispensacaoItemUpdateWithoutDispensacaoInput, DispensacaoItemUncheckedUpdateWithoutDispensacaoInput>
  }

  export type DispensacaoItemUpdateManyWithWhereWithoutDispensacaoInput = {
    where: DispensacaoItemScalarWhereInput
    data: XOR<DispensacaoItemUpdateManyMutationInput, DispensacaoItemUncheckedUpdateManyWithoutDispensacaoInput>
  }

  export type DispensacaoCreateWithoutItensInput = {
    id?: string
    usuarioId: string
    dataDispensacao?: Date | string
    observacoes?: string | null
    criadoEm?: Date | string
    paciente: PacienteCreateNestedOneWithoutDispensacoesInput
    prescricao?: PrescricaoCreateNestedOneWithoutDispensacoesInput
  }

  export type DispensacaoUncheckedCreateWithoutItensInput = {
    id?: string
    pacienteId: string
    prescricaoId?: string | null
    usuarioId: string
    dataDispensacao?: Date | string
    observacoes?: string | null
    criadoEm?: Date | string
  }

  export type DispensacaoCreateOrConnectWithoutItensInput = {
    where: DispensacaoWhereUniqueInput
    create: XOR<DispensacaoCreateWithoutItensInput, DispensacaoUncheckedCreateWithoutItensInput>
  }

  export type MedicamentoCreateWithoutDispensacaoItensInput = {
    id?: string
    catmatCodigo?: string | null
    nome: string
    principioAtivo?: string | null
    formaFarmaceutica?: string | null
    concentracao?: string | null
    unidadeMedida?: string
    quantidadePorEmbalagem?: number
    estoqueMinimo?: number
    criadoEm?: Date | string
    atualizadoEm?: Date | string
    deletedAt?: Date | string | null
    lotes?: LoteCreateNestedManyWithoutMedicamentoInput
    embalagensFracionadas?: EmbalageFracionadaCreateNestedManyWithoutMedicamentoInput
  }

  export type MedicamentoUncheckedCreateWithoutDispensacaoItensInput = {
    id?: string
    catmatCodigo?: string | null
    nome: string
    principioAtivo?: string | null
    formaFarmaceutica?: string | null
    concentracao?: string | null
    unidadeMedida?: string
    quantidadePorEmbalagem?: number
    estoqueMinimo?: number
    criadoEm?: Date | string
    atualizadoEm?: Date | string
    deletedAt?: Date | string | null
    lotes?: LoteUncheckedCreateNestedManyWithoutMedicamentoInput
    embalagensFracionadas?: EmbalageFracionadaUncheckedCreateNestedManyWithoutMedicamentoInput
  }

  export type MedicamentoCreateOrConnectWithoutDispensacaoItensInput = {
    where: MedicamentoWhereUniqueInput
    create: XOR<MedicamentoCreateWithoutDispensacaoItensInput, MedicamentoUncheckedCreateWithoutDispensacaoItensInput>
  }

  export type LoteCreateWithoutDispensacaoItensInput = {
    id?: string
    numeroLote: string
    quantidade: number
    quantidadeAtual: number
    quantidadeCaixasFechadas?: number
    quantidadePorCaixa?: number
    validade: Date | string
    fornecedor?: string | null
    notaFiscal?: string | null
    criadoEm?: Date | string
    deletedAt?: Date | string | null
    medicamento: MedicamentoCreateNestedOneWithoutLotesInput
    embalagensFracionadas?: EmbalageFracionadaCreateNestedManyWithoutLoteInput
  }

  export type LoteUncheckedCreateWithoutDispensacaoItensInput = {
    id?: string
    medicamentoId: string
    numeroLote: string
    quantidade: number
    quantidadeAtual: number
    quantidadeCaixasFechadas?: number
    quantidadePorCaixa?: number
    validade: Date | string
    fornecedor?: string | null
    notaFiscal?: string | null
    criadoEm?: Date | string
    deletedAt?: Date | string | null
    embalagensFracionadas?: EmbalageFracionadaUncheckedCreateNestedManyWithoutLoteInput
  }

  export type LoteCreateOrConnectWithoutDispensacaoItensInput = {
    where: LoteWhereUniqueInput
    create: XOR<LoteCreateWithoutDispensacaoItensInput, LoteUncheckedCreateWithoutDispensacaoItensInput>
  }

  export type EmbalageFracionadaCreateWithoutDispensacaoItensInput = {
    id?: string
    codigoQr: string
    quantidadeAtual: number
    status?: string
    criadoEm?: Date | string
    atualizadoEm?: Date | string
    criadoPor: string
    lote: LoteCreateNestedOneWithoutEmbalagensFracionadasInput
    medicamento: MedicamentoCreateNestedOneWithoutEmbalagensFracionadasInput
    movimentacoes?: MovimentacaoFracionadaCreateNestedManyWithoutEmbalagemInput
  }

  export type EmbalageFracionadaUncheckedCreateWithoutDispensacaoItensInput = {
    id?: string
    loteId: string
    medicamentoId: string
    codigoQr: string
    quantidadeAtual: number
    status?: string
    criadoEm?: Date | string
    atualizadoEm?: Date | string
    criadoPor: string
    movimentacoes?: MovimentacaoFracionadaUncheckedCreateNestedManyWithoutEmbalagemInput
  }

  export type EmbalageFracionadaCreateOrConnectWithoutDispensacaoItensInput = {
    where: EmbalageFracionadaWhereUniqueInput
    create: XOR<EmbalageFracionadaCreateWithoutDispensacaoItensInput, EmbalageFracionadaUncheckedCreateWithoutDispensacaoItensInput>
  }

  export type DispensacaoUpsertWithoutItensInput = {
    update: XOR<DispensacaoUpdateWithoutItensInput, DispensacaoUncheckedUpdateWithoutItensInput>
    create: XOR<DispensacaoCreateWithoutItensInput, DispensacaoUncheckedCreateWithoutItensInput>
    where?: DispensacaoWhereInput
  }

  export type DispensacaoUpdateToOneWithWhereWithoutItensInput = {
    where?: DispensacaoWhereInput
    data: XOR<DispensacaoUpdateWithoutItensInput, DispensacaoUncheckedUpdateWithoutItensInput>
  }

  export type DispensacaoUpdateWithoutItensInput = {
    id?: StringFieldUpdateOperationsInput | string
    usuarioId?: StringFieldUpdateOperationsInput | string
    dataDispensacao?: DateTimeFieldUpdateOperationsInput | Date | string
    observacoes?: NullableStringFieldUpdateOperationsInput | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    paciente?: PacienteUpdateOneRequiredWithoutDispensacoesNestedInput
    prescricao?: PrescricaoUpdateOneWithoutDispensacoesNestedInput
  }

  export type DispensacaoUncheckedUpdateWithoutItensInput = {
    id?: StringFieldUpdateOperationsInput | string
    pacienteId?: StringFieldUpdateOperationsInput | string
    prescricaoId?: NullableStringFieldUpdateOperationsInput | string | null
    usuarioId?: StringFieldUpdateOperationsInput | string
    dataDispensacao?: DateTimeFieldUpdateOperationsInput | Date | string
    observacoes?: NullableStringFieldUpdateOperationsInput | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MedicamentoUpsertWithoutDispensacaoItensInput = {
    update: XOR<MedicamentoUpdateWithoutDispensacaoItensInput, MedicamentoUncheckedUpdateWithoutDispensacaoItensInput>
    create: XOR<MedicamentoCreateWithoutDispensacaoItensInput, MedicamentoUncheckedCreateWithoutDispensacaoItensInput>
    where?: MedicamentoWhereInput
  }

  export type MedicamentoUpdateToOneWithWhereWithoutDispensacaoItensInput = {
    where?: MedicamentoWhereInput
    data: XOR<MedicamentoUpdateWithoutDispensacaoItensInput, MedicamentoUncheckedUpdateWithoutDispensacaoItensInput>
  }

  export type MedicamentoUpdateWithoutDispensacaoItensInput = {
    id?: StringFieldUpdateOperationsInput | string
    catmatCodigo?: NullableStringFieldUpdateOperationsInput | string | null
    nome?: StringFieldUpdateOperationsInput | string
    principioAtivo?: NullableStringFieldUpdateOperationsInput | string | null
    formaFarmaceutica?: NullableStringFieldUpdateOperationsInput | string | null
    concentracao?: NullableStringFieldUpdateOperationsInput | string | null
    unidadeMedida?: StringFieldUpdateOperationsInput | string
    quantidadePorEmbalagem?: IntFieldUpdateOperationsInput | number
    estoqueMinimo?: IntFieldUpdateOperationsInput | number
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lotes?: LoteUpdateManyWithoutMedicamentoNestedInput
    embalagensFracionadas?: EmbalageFracionadaUpdateManyWithoutMedicamentoNestedInput
  }

  export type MedicamentoUncheckedUpdateWithoutDispensacaoItensInput = {
    id?: StringFieldUpdateOperationsInput | string
    catmatCodigo?: NullableStringFieldUpdateOperationsInput | string | null
    nome?: StringFieldUpdateOperationsInput | string
    principioAtivo?: NullableStringFieldUpdateOperationsInput | string | null
    formaFarmaceutica?: NullableStringFieldUpdateOperationsInput | string | null
    concentracao?: NullableStringFieldUpdateOperationsInput | string | null
    unidadeMedida?: StringFieldUpdateOperationsInput | string
    quantidadePorEmbalagem?: IntFieldUpdateOperationsInput | number
    estoqueMinimo?: IntFieldUpdateOperationsInput | number
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lotes?: LoteUncheckedUpdateManyWithoutMedicamentoNestedInput
    embalagensFracionadas?: EmbalageFracionadaUncheckedUpdateManyWithoutMedicamentoNestedInput
  }

  export type LoteUpsertWithoutDispensacaoItensInput = {
    update: XOR<LoteUpdateWithoutDispensacaoItensInput, LoteUncheckedUpdateWithoutDispensacaoItensInput>
    create: XOR<LoteCreateWithoutDispensacaoItensInput, LoteUncheckedCreateWithoutDispensacaoItensInput>
    where?: LoteWhereInput
  }

  export type LoteUpdateToOneWithWhereWithoutDispensacaoItensInput = {
    where?: LoteWhereInput
    data: XOR<LoteUpdateWithoutDispensacaoItensInput, LoteUncheckedUpdateWithoutDispensacaoItensInput>
  }

  export type LoteUpdateWithoutDispensacaoItensInput = {
    id?: StringFieldUpdateOperationsInput | string
    numeroLote?: StringFieldUpdateOperationsInput | string
    quantidade?: IntFieldUpdateOperationsInput | number
    quantidadeAtual?: IntFieldUpdateOperationsInput | number
    quantidadeCaixasFechadas?: IntFieldUpdateOperationsInput | number
    quantidadePorCaixa?: IntFieldUpdateOperationsInput | number
    validade?: DateTimeFieldUpdateOperationsInput | Date | string
    fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    notaFiscal?: NullableStringFieldUpdateOperationsInput | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    medicamento?: MedicamentoUpdateOneRequiredWithoutLotesNestedInput
    embalagensFracionadas?: EmbalageFracionadaUpdateManyWithoutLoteNestedInput
  }

  export type LoteUncheckedUpdateWithoutDispensacaoItensInput = {
    id?: StringFieldUpdateOperationsInput | string
    medicamentoId?: StringFieldUpdateOperationsInput | string
    numeroLote?: StringFieldUpdateOperationsInput | string
    quantidade?: IntFieldUpdateOperationsInput | number
    quantidadeAtual?: IntFieldUpdateOperationsInput | number
    quantidadeCaixasFechadas?: IntFieldUpdateOperationsInput | number
    quantidadePorCaixa?: IntFieldUpdateOperationsInput | number
    validade?: DateTimeFieldUpdateOperationsInput | Date | string
    fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    notaFiscal?: NullableStringFieldUpdateOperationsInput | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    embalagensFracionadas?: EmbalageFracionadaUncheckedUpdateManyWithoutLoteNestedInput
  }

  export type EmbalageFracionadaUpsertWithoutDispensacaoItensInput = {
    update: XOR<EmbalageFracionadaUpdateWithoutDispensacaoItensInput, EmbalageFracionadaUncheckedUpdateWithoutDispensacaoItensInput>
    create: XOR<EmbalageFracionadaCreateWithoutDispensacaoItensInput, EmbalageFracionadaUncheckedCreateWithoutDispensacaoItensInput>
    where?: EmbalageFracionadaWhereInput
  }

  export type EmbalageFracionadaUpdateToOneWithWhereWithoutDispensacaoItensInput = {
    where?: EmbalageFracionadaWhereInput
    data: XOR<EmbalageFracionadaUpdateWithoutDispensacaoItensInput, EmbalageFracionadaUncheckedUpdateWithoutDispensacaoItensInput>
  }

  export type EmbalageFracionadaUpdateWithoutDispensacaoItensInput = {
    id?: StringFieldUpdateOperationsInput | string
    codigoQr?: StringFieldUpdateOperationsInput | string
    quantidadeAtual?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    criadoPor?: StringFieldUpdateOperationsInput | string
    lote?: LoteUpdateOneRequiredWithoutEmbalagensFracionadasNestedInput
    medicamento?: MedicamentoUpdateOneRequiredWithoutEmbalagensFracionadasNestedInput
    movimentacoes?: MovimentacaoFracionadaUpdateManyWithoutEmbalagemNestedInput
  }

  export type EmbalageFracionadaUncheckedUpdateWithoutDispensacaoItensInput = {
    id?: StringFieldUpdateOperationsInput | string
    loteId?: StringFieldUpdateOperationsInput | string
    medicamentoId?: StringFieldUpdateOperationsInput | string
    codigoQr?: StringFieldUpdateOperationsInput | string
    quantidadeAtual?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    criadoPor?: StringFieldUpdateOperationsInput | string
    movimentacoes?: MovimentacaoFracionadaUncheckedUpdateManyWithoutEmbalagemNestedInput
  }

  export type LoteCreateWithoutEmbalagensFracionadasInput = {
    id?: string
    numeroLote: string
    quantidade: number
    quantidadeAtual: number
    quantidadeCaixasFechadas?: number
    quantidadePorCaixa?: number
    validade: Date | string
    fornecedor?: string | null
    notaFiscal?: string | null
    criadoEm?: Date | string
    deletedAt?: Date | string | null
    medicamento: MedicamentoCreateNestedOneWithoutLotesInput
    dispensacaoItens?: DispensacaoItemCreateNestedManyWithoutLoteInput
  }

  export type LoteUncheckedCreateWithoutEmbalagensFracionadasInput = {
    id?: string
    medicamentoId: string
    numeroLote: string
    quantidade: number
    quantidadeAtual: number
    quantidadeCaixasFechadas?: number
    quantidadePorCaixa?: number
    validade: Date | string
    fornecedor?: string | null
    notaFiscal?: string | null
    criadoEm?: Date | string
    deletedAt?: Date | string | null
    dispensacaoItens?: DispensacaoItemUncheckedCreateNestedManyWithoutLoteInput
  }

  export type LoteCreateOrConnectWithoutEmbalagensFracionadasInput = {
    where: LoteWhereUniqueInput
    create: XOR<LoteCreateWithoutEmbalagensFracionadasInput, LoteUncheckedCreateWithoutEmbalagensFracionadasInput>
  }

  export type MedicamentoCreateWithoutEmbalagensFracionadasInput = {
    id?: string
    catmatCodigo?: string | null
    nome: string
    principioAtivo?: string | null
    formaFarmaceutica?: string | null
    concentracao?: string | null
    unidadeMedida?: string
    quantidadePorEmbalagem?: number
    estoqueMinimo?: number
    criadoEm?: Date | string
    atualizadoEm?: Date | string
    deletedAt?: Date | string | null
    lotes?: LoteCreateNestedManyWithoutMedicamentoInput
    dispensacaoItens?: DispensacaoItemCreateNestedManyWithoutMedicamentoInput
  }

  export type MedicamentoUncheckedCreateWithoutEmbalagensFracionadasInput = {
    id?: string
    catmatCodigo?: string | null
    nome: string
    principioAtivo?: string | null
    formaFarmaceutica?: string | null
    concentracao?: string | null
    unidadeMedida?: string
    quantidadePorEmbalagem?: number
    estoqueMinimo?: number
    criadoEm?: Date | string
    atualizadoEm?: Date | string
    deletedAt?: Date | string | null
    lotes?: LoteUncheckedCreateNestedManyWithoutMedicamentoInput
    dispensacaoItens?: DispensacaoItemUncheckedCreateNestedManyWithoutMedicamentoInput
  }

  export type MedicamentoCreateOrConnectWithoutEmbalagensFracionadasInput = {
    where: MedicamentoWhereUniqueInput
    create: XOR<MedicamentoCreateWithoutEmbalagensFracionadasInput, MedicamentoUncheckedCreateWithoutEmbalagensFracionadasInput>
  }

  export type DispensacaoItemCreateWithoutEmbalagemInput = {
    id?: string
    quantidade: number
    criadoEm?: Date | string
    dispensacao: DispensacaoCreateNestedOneWithoutItensInput
    medicamento: MedicamentoCreateNestedOneWithoutDispensacaoItensInput
    lote?: LoteCreateNestedOneWithoutDispensacaoItensInput
  }

  export type DispensacaoItemUncheckedCreateWithoutEmbalagemInput = {
    id?: string
    dispensacaoId: string
    medicamentoId: string
    loteId?: string | null
    quantidade: number
    criadoEm?: Date | string
  }

  export type DispensacaoItemCreateOrConnectWithoutEmbalagemInput = {
    where: DispensacaoItemWhereUniqueInput
    create: XOR<DispensacaoItemCreateWithoutEmbalagemInput, DispensacaoItemUncheckedCreateWithoutEmbalagemInput>
  }

  export type DispensacaoItemCreateManyEmbalagemInputEnvelope = {
    data: DispensacaoItemCreateManyEmbalagemInput | DispensacaoItemCreateManyEmbalagemInput[]
    skipDuplicates?: boolean
  }

  export type MovimentacaoFracionadaCreateWithoutEmbalagemInput = {
    id?: string
    tipo: string
    quantidadeAnterior: number
    quantidadeMovimentada: number
    quantidadeResultante: number
    codigoQrAnterior?: string | null
    codigoQrNovo?: string | null
    usuarioId: string
    observacao?: string | null
    criadoEm?: Date | string
  }

  export type MovimentacaoFracionadaUncheckedCreateWithoutEmbalagemInput = {
    id?: string
    tipo: string
    quantidadeAnterior: number
    quantidadeMovimentada: number
    quantidadeResultante: number
    codigoQrAnterior?: string | null
    codigoQrNovo?: string | null
    usuarioId: string
    observacao?: string | null
    criadoEm?: Date | string
  }

  export type MovimentacaoFracionadaCreateOrConnectWithoutEmbalagemInput = {
    where: MovimentacaoFracionadaWhereUniqueInput
    create: XOR<MovimentacaoFracionadaCreateWithoutEmbalagemInput, MovimentacaoFracionadaUncheckedCreateWithoutEmbalagemInput>
  }

  export type MovimentacaoFracionadaCreateManyEmbalagemInputEnvelope = {
    data: MovimentacaoFracionadaCreateManyEmbalagemInput | MovimentacaoFracionadaCreateManyEmbalagemInput[]
    skipDuplicates?: boolean
  }

  export type LoteUpsertWithoutEmbalagensFracionadasInput = {
    update: XOR<LoteUpdateWithoutEmbalagensFracionadasInput, LoteUncheckedUpdateWithoutEmbalagensFracionadasInput>
    create: XOR<LoteCreateWithoutEmbalagensFracionadasInput, LoteUncheckedCreateWithoutEmbalagensFracionadasInput>
    where?: LoteWhereInput
  }

  export type LoteUpdateToOneWithWhereWithoutEmbalagensFracionadasInput = {
    where?: LoteWhereInput
    data: XOR<LoteUpdateWithoutEmbalagensFracionadasInput, LoteUncheckedUpdateWithoutEmbalagensFracionadasInput>
  }

  export type LoteUpdateWithoutEmbalagensFracionadasInput = {
    id?: StringFieldUpdateOperationsInput | string
    numeroLote?: StringFieldUpdateOperationsInput | string
    quantidade?: IntFieldUpdateOperationsInput | number
    quantidadeAtual?: IntFieldUpdateOperationsInput | number
    quantidadeCaixasFechadas?: IntFieldUpdateOperationsInput | number
    quantidadePorCaixa?: IntFieldUpdateOperationsInput | number
    validade?: DateTimeFieldUpdateOperationsInput | Date | string
    fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    notaFiscal?: NullableStringFieldUpdateOperationsInput | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    medicamento?: MedicamentoUpdateOneRequiredWithoutLotesNestedInput
    dispensacaoItens?: DispensacaoItemUpdateManyWithoutLoteNestedInput
  }

  export type LoteUncheckedUpdateWithoutEmbalagensFracionadasInput = {
    id?: StringFieldUpdateOperationsInput | string
    medicamentoId?: StringFieldUpdateOperationsInput | string
    numeroLote?: StringFieldUpdateOperationsInput | string
    quantidade?: IntFieldUpdateOperationsInput | number
    quantidadeAtual?: IntFieldUpdateOperationsInput | number
    quantidadeCaixasFechadas?: IntFieldUpdateOperationsInput | number
    quantidadePorCaixa?: IntFieldUpdateOperationsInput | number
    validade?: DateTimeFieldUpdateOperationsInput | Date | string
    fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    notaFiscal?: NullableStringFieldUpdateOperationsInput | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    dispensacaoItens?: DispensacaoItemUncheckedUpdateManyWithoutLoteNestedInput
  }

  export type MedicamentoUpsertWithoutEmbalagensFracionadasInput = {
    update: XOR<MedicamentoUpdateWithoutEmbalagensFracionadasInput, MedicamentoUncheckedUpdateWithoutEmbalagensFracionadasInput>
    create: XOR<MedicamentoCreateWithoutEmbalagensFracionadasInput, MedicamentoUncheckedCreateWithoutEmbalagensFracionadasInput>
    where?: MedicamentoWhereInput
  }

  export type MedicamentoUpdateToOneWithWhereWithoutEmbalagensFracionadasInput = {
    where?: MedicamentoWhereInput
    data: XOR<MedicamentoUpdateWithoutEmbalagensFracionadasInput, MedicamentoUncheckedUpdateWithoutEmbalagensFracionadasInput>
  }

  export type MedicamentoUpdateWithoutEmbalagensFracionadasInput = {
    id?: StringFieldUpdateOperationsInput | string
    catmatCodigo?: NullableStringFieldUpdateOperationsInput | string | null
    nome?: StringFieldUpdateOperationsInput | string
    principioAtivo?: NullableStringFieldUpdateOperationsInput | string | null
    formaFarmaceutica?: NullableStringFieldUpdateOperationsInput | string | null
    concentracao?: NullableStringFieldUpdateOperationsInput | string | null
    unidadeMedida?: StringFieldUpdateOperationsInput | string
    quantidadePorEmbalagem?: IntFieldUpdateOperationsInput | number
    estoqueMinimo?: IntFieldUpdateOperationsInput | number
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lotes?: LoteUpdateManyWithoutMedicamentoNestedInput
    dispensacaoItens?: DispensacaoItemUpdateManyWithoutMedicamentoNestedInput
  }

  export type MedicamentoUncheckedUpdateWithoutEmbalagensFracionadasInput = {
    id?: StringFieldUpdateOperationsInput | string
    catmatCodigo?: NullableStringFieldUpdateOperationsInput | string | null
    nome?: StringFieldUpdateOperationsInput | string
    principioAtivo?: NullableStringFieldUpdateOperationsInput | string | null
    formaFarmaceutica?: NullableStringFieldUpdateOperationsInput | string | null
    concentracao?: NullableStringFieldUpdateOperationsInput | string | null
    unidadeMedida?: StringFieldUpdateOperationsInput | string
    quantidadePorEmbalagem?: IntFieldUpdateOperationsInput | number
    estoqueMinimo?: IntFieldUpdateOperationsInput | number
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lotes?: LoteUncheckedUpdateManyWithoutMedicamentoNestedInput
    dispensacaoItens?: DispensacaoItemUncheckedUpdateManyWithoutMedicamentoNestedInput
  }

  export type DispensacaoItemUpsertWithWhereUniqueWithoutEmbalagemInput = {
    where: DispensacaoItemWhereUniqueInput
    update: XOR<DispensacaoItemUpdateWithoutEmbalagemInput, DispensacaoItemUncheckedUpdateWithoutEmbalagemInput>
    create: XOR<DispensacaoItemCreateWithoutEmbalagemInput, DispensacaoItemUncheckedCreateWithoutEmbalagemInput>
  }

  export type DispensacaoItemUpdateWithWhereUniqueWithoutEmbalagemInput = {
    where: DispensacaoItemWhereUniqueInput
    data: XOR<DispensacaoItemUpdateWithoutEmbalagemInput, DispensacaoItemUncheckedUpdateWithoutEmbalagemInput>
  }

  export type DispensacaoItemUpdateManyWithWhereWithoutEmbalagemInput = {
    where: DispensacaoItemScalarWhereInput
    data: XOR<DispensacaoItemUpdateManyMutationInput, DispensacaoItemUncheckedUpdateManyWithoutEmbalagemInput>
  }

  export type MovimentacaoFracionadaUpsertWithWhereUniqueWithoutEmbalagemInput = {
    where: MovimentacaoFracionadaWhereUniqueInput
    update: XOR<MovimentacaoFracionadaUpdateWithoutEmbalagemInput, MovimentacaoFracionadaUncheckedUpdateWithoutEmbalagemInput>
    create: XOR<MovimentacaoFracionadaCreateWithoutEmbalagemInput, MovimentacaoFracionadaUncheckedCreateWithoutEmbalagemInput>
  }

  export type MovimentacaoFracionadaUpdateWithWhereUniqueWithoutEmbalagemInput = {
    where: MovimentacaoFracionadaWhereUniqueInput
    data: XOR<MovimentacaoFracionadaUpdateWithoutEmbalagemInput, MovimentacaoFracionadaUncheckedUpdateWithoutEmbalagemInput>
  }

  export type MovimentacaoFracionadaUpdateManyWithWhereWithoutEmbalagemInput = {
    where: MovimentacaoFracionadaScalarWhereInput
    data: XOR<MovimentacaoFracionadaUpdateManyMutationInput, MovimentacaoFracionadaUncheckedUpdateManyWithoutEmbalagemInput>
  }

  export type MovimentacaoFracionadaScalarWhereInput = {
    AND?: MovimentacaoFracionadaScalarWhereInput | MovimentacaoFracionadaScalarWhereInput[]
    OR?: MovimentacaoFracionadaScalarWhereInput[]
    NOT?: MovimentacaoFracionadaScalarWhereInput | MovimentacaoFracionadaScalarWhereInput[]
    id?: StringFilter<"MovimentacaoFracionada"> | string
    embalagemFracionadaId?: StringFilter<"MovimentacaoFracionada"> | string
    tipo?: StringFilter<"MovimentacaoFracionada"> | string
    quantidadeAnterior?: IntFilter<"MovimentacaoFracionada"> | number
    quantidadeMovimentada?: IntFilter<"MovimentacaoFracionada"> | number
    quantidadeResultante?: IntFilter<"MovimentacaoFracionada"> | number
    codigoQrAnterior?: StringNullableFilter<"MovimentacaoFracionada"> | string | null
    codigoQrNovo?: StringNullableFilter<"MovimentacaoFracionada"> | string | null
    usuarioId?: StringFilter<"MovimentacaoFracionada"> | string
    observacao?: StringNullableFilter<"MovimentacaoFracionada"> | string | null
    criadoEm?: DateTimeFilter<"MovimentacaoFracionada"> | Date | string
  }

  export type EmbalageFracionadaCreateWithoutMovimentacoesInput = {
    id?: string
    codigoQr: string
    quantidadeAtual: number
    status?: string
    criadoEm?: Date | string
    atualizadoEm?: Date | string
    criadoPor: string
    lote: LoteCreateNestedOneWithoutEmbalagensFracionadasInput
    medicamento: MedicamentoCreateNestedOneWithoutEmbalagensFracionadasInput
    dispensacaoItens?: DispensacaoItemCreateNestedManyWithoutEmbalagemInput
  }

  export type EmbalageFracionadaUncheckedCreateWithoutMovimentacoesInput = {
    id?: string
    loteId: string
    medicamentoId: string
    codigoQr: string
    quantidadeAtual: number
    status?: string
    criadoEm?: Date | string
    atualizadoEm?: Date | string
    criadoPor: string
    dispensacaoItens?: DispensacaoItemUncheckedCreateNestedManyWithoutEmbalagemInput
  }

  export type EmbalageFracionadaCreateOrConnectWithoutMovimentacoesInput = {
    where: EmbalageFracionadaWhereUniqueInput
    create: XOR<EmbalageFracionadaCreateWithoutMovimentacoesInput, EmbalageFracionadaUncheckedCreateWithoutMovimentacoesInput>
  }

  export type EmbalageFracionadaUpsertWithoutMovimentacoesInput = {
    update: XOR<EmbalageFracionadaUpdateWithoutMovimentacoesInput, EmbalageFracionadaUncheckedUpdateWithoutMovimentacoesInput>
    create: XOR<EmbalageFracionadaCreateWithoutMovimentacoesInput, EmbalageFracionadaUncheckedCreateWithoutMovimentacoesInput>
    where?: EmbalageFracionadaWhereInput
  }

  export type EmbalageFracionadaUpdateToOneWithWhereWithoutMovimentacoesInput = {
    where?: EmbalageFracionadaWhereInput
    data: XOR<EmbalageFracionadaUpdateWithoutMovimentacoesInput, EmbalageFracionadaUncheckedUpdateWithoutMovimentacoesInput>
  }

  export type EmbalageFracionadaUpdateWithoutMovimentacoesInput = {
    id?: StringFieldUpdateOperationsInput | string
    codigoQr?: StringFieldUpdateOperationsInput | string
    quantidadeAtual?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    criadoPor?: StringFieldUpdateOperationsInput | string
    lote?: LoteUpdateOneRequiredWithoutEmbalagensFracionadasNestedInput
    medicamento?: MedicamentoUpdateOneRequiredWithoutEmbalagensFracionadasNestedInput
    dispensacaoItens?: DispensacaoItemUpdateManyWithoutEmbalagemNestedInput
  }

  export type EmbalageFracionadaUncheckedUpdateWithoutMovimentacoesInput = {
    id?: StringFieldUpdateOperationsInput | string
    loteId?: StringFieldUpdateOperationsInput | string
    medicamentoId?: StringFieldUpdateOperationsInput | string
    codigoQr?: StringFieldUpdateOperationsInput | string
    quantidadeAtual?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    criadoPor?: StringFieldUpdateOperationsInput | string
    dispensacaoItens?: DispensacaoItemUncheckedUpdateManyWithoutEmbalagemNestedInput
  }

  export type LoteCreateManyMedicamentoInput = {
    id?: string
    numeroLote: string
    quantidade: number
    quantidadeAtual: number
    quantidadeCaixasFechadas?: number
    quantidadePorCaixa?: number
    validade: Date | string
    fornecedor?: string | null
    notaFiscal?: string | null
    criadoEm?: Date | string
    deletedAt?: Date | string | null
  }

  export type DispensacaoItemCreateManyMedicamentoInput = {
    id?: string
    dispensacaoId: string
    loteId?: string | null
    embalagemFracionadaId?: string | null
    quantidade: number
    criadoEm?: Date | string
  }

  export type EmbalageFracionadaCreateManyMedicamentoInput = {
    id?: string
    loteId: string
    codigoQr: string
    quantidadeAtual: number
    status?: string
    criadoEm?: Date | string
    atualizadoEm?: Date | string
    criadoPor: string
  }

  export type LoteUpdateWithoutMedicamentoInput = {
    id?: StringFieldUpdateOperationsInput | string
    numeroLote?: StringFieldUpdateOperationsInput | string
    quantidade?: IntFieldUpdateOperationsInput | number
    quantidadeAtual?: IntFieldUpdateOperationsInput | number
    quantidadeCaixasFechadas?: IntFieldUpdateOperationsInput | number
    quantidadePorCaixa?: IntFieldUpdateOperationsInput | number
    validade?: DateTimeFieldUpdateOperationsInput | Date | string
    fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    notaFiscal?: NullableStringFieldUpdateOperationsInput | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    dispensacaoItens?: DispensacaoItemUpdateManyWithoutLoteNestedInput
    embalagensFracionadas?: EmbalageFracionadaUpdateManyWithoutLoteNestedInput
  }

  export type LoteUncheckedUpdateWithoutMedicamentoInput = {
    id?: StringFieldUpdateOperationsInput | string
    numeroLote?: StringFieldUpdateOperationsInput | string
    quantidade?: IntFieldUpdateOperationsInput | number
    quantidadeAtual?: IntFieldUpdateOperationsInput | number
    quantidadeCaixasFechadas?: IntFieldUpdateOperationsInput | number
    quantidadePorCaixa?: IntFieldUpdateOperationsInput | number
    validade?: DateTimeFieldUpdateOperationsInput | Date | string
    fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    notaFiscal?: NullableStringFieldUpdateOperationsInput | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    dispensacaoItens?: DispensacaoItemUncheckedUpdateManyWithoutLoteNestedInput
    embalagensFracionadas?: EmbalageFracionadaUncheckedUpdateManyWithoutLoteNestedInput
  }

  export type LoteUncheckedUpdateManyWithoutMedicamentoInput = {
    id?: StringFieldUpdateOperationsInput | string
    numeroLote?: StringFieldUpdateOperationsInput | string
    quantidade?: IntFieldUpdateOperationsInput | number
    quantidadeAtual?: IntFieldUpdateOperationsInput | number
    quantidadeCaixasFechadas?: IntFieldUpdateOperationsInput | number
    quantidadePorCaixa?: IntFieldUpdateOperationsInput | number
    validade?: DateTimeFieldUpdateOperationsInput | Date | string
    fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    notaFiscal?: NullableStringFieldUpdateOperationsInput | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type DispensacaoItemUpdateWithoutMedicamentoInput = {
    id?: StringFieldUpdateOperationsInput | string
    quantidade?: IntFieldUpdateOperationsInput | number
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    dispensacao?: DispensacaoUpdateOneRequiredWithoutItensNestedInput
    lote?: LoteUpdateOneWithoutDispensacaoItensNestedInput
    embalagem?: EmbalageFracionadaUpdateOneWithoutDispensacaoItensNestedInput
  }

  export type DispensacaoItemUncheckedUpdateWithoutMedicamentoInput = {
    id?: StringFieldUpdateOperationsInput | string
    dispensacaoId?: StringFieldUpdateOperationsInput | string
    loteId?: NullableStringFieldUpdateOperationsInput | string | null
    embalagemFracionadaId?: NullableStringFieldUpdateOperationsInput | string | null
    quantidade?: IntFieldUpdateOperationsInput | number
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DispensacaoItemUncheckedUpdateManyWithoutMedicamentoInput = {
    id?: StringFieldUpdateOperationsInput | string
    dispensacaoId?: StringFieldUpdateOperationsInput | string
    loteId?: NullableStringFieldUpdateOperationsInput | string | null
    embalagemFracionadaId?: NullableStringFieldUpdateOperationsInput | string | null
    quantidade?: IntFieldUpdateOperationsInput | number
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EmbalageFracionadaUpdateWithoutMedicamentoInput = {
    id?: StringFieldUpdateOperationsInput | string
    codigoQr?: StringFieldUpdateOperationsInput | string
    quantidadeAtual?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    criadoPor?: StringFieldUpdateOperationsInput | string
    lote?: LoteUpdateOneRequiredWithoutEmbalagensFracionadasNestedInput
    dispensacaoItens?: DispensacaoItemUpdateManyWithoutEmbalagemNestedInput
    movimentacoes?: MovimentacaoFracionadaUpdateManyWithoutEmbalagemNestedInput
  }

  export type EmbalageFracionadaUncheckedUpdateWithoutMedicamentoInput = {
    id?: StringFieldUpdateOperationsInput | string
    loteId?: StringFieldUpdateOperationsInput | string
    codigoQr?: StringFieldUpdateOperationsInput | string
    quantidadeAtual?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    criadoPor?: StringFieldUpdateOperationsInput | string
    dispensacaoItens?: DispensacaoItemUncheckedUpdateManyWithoutEmbalagemNestedInput
    movimentacoes?: MovimentacaoFracionadaUncheckedUpdateManyWithoutEmbalagemNestedInput
  }

  export type EmbalageFracionadaUncheckedUpdateManyWithoutMedicamentoInput = {
    id?: StringFieldUpdateOperationsInput | string
    loteId?: StringFieldUpdateOperationsInput | string
    codigoQr?: StringFieldUpdateOperationsInput | string
    quantidadeAtual?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    criadoPor?: StringFieldUpdateOperationsInput | string
  }

  export type DispensacaoItemCreateManyLoteInput = {
    id?: string
    dispensacaoId: string
    medicamentoId: string
    embalagemFracionadaId?: string | null
    quantidade: number
    criadoEm?: Date | string
  }

  export type EmbalageFracionadaCreateManyLoteInput = {
    id?: string
    medicamentoId: string
    codigoQr: string
    quantidadeAtual: number
    status?: string
    criadoEm?: Date | string
    atualizadoEm?: Date | string
    criadoPor: string
  }

  export type DispensacaoItemUpdateWithoutLoteInput = {
    id?: StringFieldUpdateOperationsInput | string
    quantidade?: IntFieldUpdateOperationsInput | number
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    dispensacao?: DispensacaoUpdateOneRequiredWithoutItensNestedInput
    medicamento?: MedicamentoUpdateOneRequiredWithoutDispensacaoItensNestedInput
    embalagem?: EmbalageFracionadaUpdateOneWithoutDispensacaoItensNestedInput
  }

  export type DispensacaoItemUncheckedUpdateWithoutLoteInput = {
    id?: StringFieldUpdateOperationsInput | string
    dispensacaoId?: StringFieldUpdateOperationsInput | string
    medicamentoId?: StringFieldUpdateOperationsInput | string
    embalagemFracionadaId?: NullableStringFieldUpdateOperationsInput | string | null
    quantidade?: IntFieldUpdateOperationsInput | number
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DispensacaoItemUncheckedUpdateManyWithoutLoteInput = {
    id?: StringFieldUpdateOperationsInput | string
    dispensacaoId?: StringFieldUpdateOperationsInput | string
    medicamentoId?: StringFieldUpdateOperationsInput | string
    embalagemFracionadaId?: NullableStringFieldUpdateOperationsInput | string | null
    quantidade?: IntFieldUpdateOperationsInput | number
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EmbalageFracionadaUpdateWithoutLoteInput = {
    id?: StringFieldUpdateOperationsInput | string
    codigoQr?: StringFieldUpdateOperationsInput | string
    quantidadeAtual?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    criadoPor?: StringFieldUpdateOperationsInput | string
    medicamento?: MedicamentoUpdateOneRequiredWithoutEmbalagensFracionadasNestedInput
    dispensacaoItens?: DispensacaoItemUpdateManyWithoutEmbalagemNestedInput
    movimentacoes?: MovimentacaoFracionadaUpdateManyWithoutEmbalagemNestedInput
  }

  export type EmbalageFracionadaUncheckedUpdateWithoutLoteInput = {
    id?: StringFieldUpdateOperationsInput | string
    medicamentoId?: StringFieldUpdateOperationsInput | string
    codigoQr?: StringFieldUpdateOperationsInput | string
    quantidadeAtual?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    criadoPor?: StringFieldUpdateOperationsInput | string
    dispensacaoItens?: DispensacaoItemUncheckedUpdateManyWithoutEmbalagemNestedInput
    movimentacoes?: MovimentacaoFracionadaUncheckedUpdateManyWithoutEmbalagemNestedInput
  }

  export type EmbalageFracionadaUncheckedUpdateManyWithoutLoteInput = {
    id?: StringFieldUpdateOperationsInput | string
    medicamentoId?: StringFieldUpdateOperationsInput | string
    codigoQr?: StringFieldUpdateOperationsInput | string
    quantidadeAtual?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    criadoPor?: StringFieldUpdateOperationsInput | string
  }

  export type PrescricaoCreateManyPacienteInput = {
    id?: string
    medicoNome?: string | null
    crm?: string | null
    dataEmissao: Date | string
    dataValidade?: Date | string | null
    numeroReceita?: string | null
    arquivoUrl?: string | null
    observacoes?: string | null
    criadoEm?: Date | string
    deletedAt?: Date | string | null
  }

  export type DispensacaoCreateManyPacienteInput = {
    id?: string
    prescricaoId?: string | null
    usuarioId: string
    dataDispensacao?: Date | string
    observacoes?: string | null
    criadoEm?: Date | string
  }

  export type PrescricaoUpdateWithoutPacienteInput = {
    id?: StringFieldUpdateOperationsInput | string
    medicoNome?: NullableStringFieldUpdateOperationsInput | string | null
    crm?: NullableStringFieldUpdateOperationsInput | string | null
    dataEmissao?: DateTimeFieldUpdateOperationsInput | Date | string
    dataValidade?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    numeroReceita?: NullableStringFieldUpdateOperationsInput | string | null
    arquivoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    observacoes?: NullableStringFieldUpdateOperationsInput | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    dispensacoes?: DispensacaoUpdateManyWithoutPrescricaoNestedInput
  }

  export type PrescricaoUncheckedUpdateWithoutPacienteInput = {
    id?: StringFieldUpdateOperationsInput | string
    medicoNome?: NullableStringFieldUpdateOperationsInput | string | null
    crm?: NullableStringFieldUpdateOperationsInput | string | null
    dataEmissao?: DateTimeFieldUpdateOperationsInput | Date | string
    dataValidade?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    numeroReceita?: NullableStringFieldUpdateOperationsInput | string | null
    arquivoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    observacoes?: NullableStringFieldUpdateOperationsInput | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    dispensacoes?: DispensacaoUncheckedUpdateManyWithoutPrescricaoNestedInput
  }

  export type PrescricaoUncheckedUpdateManyWithoutPacienteInput = {
    id?: StringFieldUpdateOperationsInput | string
    medicoNome?: NullableStringFieldUpdateOperationsInput | string | null
    crm?: NullableStringFieldUpdateOperationsInput | string | null
    dataEmissao?: DateTimeFieldUpdateOperationsInput | Date | string
    dataValidade?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    numeroReceita?: NullableStringFieldUpdateOperationsInput | string | null
    arquivoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    observacoes?: NullableStringFieldUpdateOperationsInput | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type DispensacaoUpdateWithoutPacienteInput = {
    id?: StringFieldUpdateOperationsInput | string
    usuarioId?: StringFieldUpdateOperationsInput | string
    dataDispensacao?: DateTimeFieldUpdateOperationsInput | Date | string
    observacoes?: NullableStringFieldUpdateOperationsInput | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    prescricao?: PrescricaoUpdateOneWithoutDispensacoesNestedInput
    itens?: DispensacaoItemUpdateManyWithoutDispensacaoNestedInput
  }

  export type DispensacaoUncheckedUpdateWithoutPacienteInput = {
    id?: StringFieldUpdateOperationsInput | string
    prescricaoId?: NullableStringFieldUpdateOperationsInput | string | null
    usuarioId?: StringFieldUpdateOperationsInput | string
    dataDispensacao?: DateTimeFieldUpdateOperationsInput | Date | string
    observacoes?: NullableStringFieldUpdateOperationsInput | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    itens?: DispensacaoItemUncheckedUpdateManyWithoutDispensacaoNestedInput
  }

  export type DispensacaoUncheckedUpdateManyWithoutPacienteInput = {
    id?: StringFieldUpdateOperationsInput | string
    prescricaoId?: NullableStringFieldUpdateOperationsInput | string | null
    usuarioId?: StringFieldUpdateOperationsInput | string
    dataDispensacao?: DateTimeFieldUpdateOperationsInput | Date | string
    observacoes?: NullableStringFieldUpdateOperationsInput | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DispensacaoCreateManyPrescricaoInput = {
    id?: string
    pacienteId: string
    usuarioId: string
    dataDispensacao?: Date | string
    observacoes?: string | null
    criadoEm?: Date | string
  }

  export type DispensacaoUpdateWithoutPrescricaoInput = {
    id?: StringFieldUpdateOperationsInput | string
    usuarioId?: StringFieldUpdateOperationsInput | string
    dataDispensacao?: DateTimeFieldUpdateOperationsInput | Date | string
    observacoes?: NullableStringFieldUpdateOperationsInput | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    paciente?: PacienteUpdateOneRequiredWithoutDispensacoesNestedInput
    itens?: DispensacaoItemUpdateManyWithoutDispensacaoNestedInput
  }

  export type DispensacaoUncheckedUpdateWithoutPrescricaoInput = {
    id?: StringFieldUpdateOperationsInput | string
    pacienteId?: StringFieldUpdateOperationsInput | string
    usuarioId?: StringFieldUpdateOperationsInput | string
    dataDispensacao?: DateTimeFieldUpdateOperationsInput | Date | string
    observacoes?: NullableStringFieldUpdateOperationsInput | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    itens?: DispensacaoItemUncheckedUpdateManyWithoutDispensacaoNestedInput
  }

  export type DispensacaoUncheckedUpdateManyWithoutPrescricaoInput = {
    id?: StringFieldUpdateOperationsInput | string
    pacienteId?: StringFieldUpdateOperationsInput | string
    usuarioId?: StringFieldUpdateOperationsInput | string
    dataDispensacao?: DateTimeFieldUpdateOperationsInput | Date | string
    observacoes?: NullableStringFieldUpdateOperationsInput | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DispensacaoItemCreateManyDispensacaoInput = {
    id?: string
    medicamentoId: string
    loteId?: string | null
    embalagemFracionadaId?: string | null
    quantidade: number
    criadoEm?: Date | string
  }

  export type DispensacaoItemUpdateWithoutDispensacaoInput = {
    id?: StringFieldUpdateOperationsInput | string
    quantidade?: IntFieldUpdateOperationsInput | number
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    medicamento?: MedicamentoUpdateOneRequiredWithoutDispensacaoItensNestedInput
    lote?: LoteUpdateOneWithoutDispensacaoItensNestedInput
    embalagem?: EmbalageFracionadaUpdateOneWithoutDispensacaoItensNestedInput
  }

  export type DispensacaoItemUncheckedUpdateWithoutDispensacaoInput = {
    id?: StringFieldUpdateOperationsInput | string
    medicamentoId?: StringFieldUpdateOperationsInput | string
    loteId?: NullableStringFieldUpdateOperationsInput | string | null
    embalagemFracionadaId?: NullableStringFieldUpdateOperationsInput | string | null
    quantidade?: IntFieldUpdateOperationsInput | number
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DispensacaoItemUncheckedUpdateManyWithoutDispensacaoInput = {
    id?: StringFieldUpdateOperationsInput | string
    medicamentoId?: StringFieldUpdateOperationsInput | string
    loteId?: NullableStringFieldUpdateOperationsInput | string | null
    embalagemFracionadaId?: NullableStringFieldUpdateOperationsInput | string | null
    quantidade?: IntFieldUpdateOperationsInput | number
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DispensacaoItemCreateManyEmbalagemInput = {
    id?: string
    dispensacaoId: string
    medicamentoId: string
    loteId?: string | null
    quantidade: number
    criadoEm?: Date | string
  }

  export type MovimentacaoFracionadaCreateManyEmbalagemInput = {
    id?: string
    tipo: string
    quantidadeAnterior: number
    quantidadeMovimentada: number
    quantidadeResultante: number
    codigoQrAnterior?: string | null
    codigoQrNovo?: string | null
    usuarioId: string
    observacao?: string | null
    criadoEm?: Date | string
  }

  export type DispensacaoItemUpdateWithoutEmbalagemInput = {
    id?: StringFieldUpdateOperationsInput | string
    quantidade?: IntFieldUpdateOperationsInput | number
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    dispensacao?: DispensacaoUpdateOneRequiredWithoutItensNestedInput
    medicamento?: MedicamentoUpdateOneRequiredWithoutDispensacaoItensNestedInput
    lote?: LoteUpdateOneWithoutDispensacaoItensNestedInput
  }

  export type DispensacaoItemUncheckedUpdateWithoutEmbalagemInput = {
    id?: StringFieldUpdateOperationsInput | string
    dispensacaoId?: StringFieldUpdateOperationsInput | string
    medicamentoId?: StringFieldUpdateOperationsInput | string
    loteId?: NullableStringFieldUpdateOperationsInput | string | null
    quantidade?: IntFieldUpdateOperationsInput | number
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DispensacaoItemUncheckedUpdateManyWithoutEmbalagemInput = {
    id?: StringFieldUpdateOperationsInput | string
    dispensacaoId?: StringFieldUpdateOperationsInput | string
    medicamentoId?: StringFieldUpdateOperationsInput | string
    loteId?: NullableStringFieldUpdateOperationsInput | string | null
    quantidade?: IntFieldUpdateOperationsInput | number
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MovimentacaoFracionadaUpdateWithoutEmbalagemInput = {
    id?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    quantidadeAnterior?: IntFieldUpdateOperationsInput | number
    quantidadeMovimentada?: IntFieldUpdateOperationsInput | number
    quantidadeResultante?: IntFieldUpdateOperationsInput | number
    codigoQrAnterior?: NullableStringFieldUpdateOperationsInput | string | null
    codigoQrNovo?: NullableStringFieldUpdateOperationsInput | string | null
    usuarioId?: StringFieldUpdateOperationsInput | string
    observacao?: NullableStringFieldUpdateOperationsInput | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MovimentacaoFracionadaUncheckedUpdateWithoutEmbalagemInput = {
    id?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    quantidadeAnterior?: IntFieldUpdateOperationsInput | number
    quantidadeMovimentada?: IntFieldUpdateOperationsInput | number
    quantidadeResultante?: IntFieldUpdateOperationsInput | number
    codigoQrAnterior?: NullableStringFieldUpdateOperationsInput | string | null
    codigoQrNovo?: NullableStringFieldUpdateOperationsInput | string | null
    usuarioId?: StringFieldUpdateOperationsInput | string
    observacao?: NullableStringFieldUpdateOperationsInput | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MovimentacaoFracionadaUncheckedUpdateManyWithoutEmbalagemInput = {
    id?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    quantidadeAnterior?: IntFieldUpdateOperationsInput | number
    quantidadeMovimentada?: IntFieldUpdateOperationsInput | number
    quantidadeResultante?: IntFieldUpdateOperationsInput | number
    codigoQrAnterior?: NullableStringFieldUpdateOperationsInput | string | null
    codigoQrNovo?: NullableStringFieldUpdateOperationsInput | string | null
    usuarioId?: StringFieldUpdateOperationsInput | string
    observacao?: NullableStringFieldUpdateOperationsInput | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}