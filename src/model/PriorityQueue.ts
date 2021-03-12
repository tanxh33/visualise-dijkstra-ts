export interface QueueItem {
  val: string;
  priority: number;
};

export class PriorityQueue {
  // Keeps track which route has the total cheapest cost
  values: QueueItem[] = [];

  // constructor() {}

  enqueue = (val: string, priority: number): void => {
    this.values.push({ val, priority });
    this.sort();
  }

  dequeue = (): QueueItem | undefined => {
    return this.values.shift();
  }

  private sort = (): void => {
    this.values.sort((a, b) => a.priority - b.priority);
  }
}