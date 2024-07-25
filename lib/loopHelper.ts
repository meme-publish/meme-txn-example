export class LoopHelper {
  private static async awaitTimeout(ms: number) {
    return await new Promise(resolve => {
      setTimeout(() => {
        resolve(1);
      }, ms);
    });
  }

  public static async run<T>(props: {
    maxCount: number;
    interval: number;
    exec: () => Promise<T>;
    isStopkFun: (res: T) => boolean;
  }): Promise<T> {
    const { maxCount, interval, isStopkFun, exec } = props;

    let res: T | null = null;

    for (let index = 0; index < maxCount; index++) {
      res = await exec();
      await this.awaitTimeout(interval);
      if (isStopkFun(res)) {
        break;
      }
    }

    if (res === null) throw new Error('no result');

    return res!;
  }
}
