import { BaseClass } from "@app/base-dir/base_class";
import { BaseInterface } from "@app/base-dir/base_interface";

export class ExtendedClass extends BaseClass {
  constructor() {
    super();
  }

  public alpha = "omega";

  beta() {
    return "psi";
  }
  public gamma() {
    return "chi";
  }
}

export class ImplementedClass implements BaseInterface {
  delta: string = "delta";
  epsilon(): string {
    return "epsilon";
  }
}

export class BothClass extends BaseClass implements BaseInterface {
  constructor() {
    super();
  }

  public get delta() {
    return "delta";
  }

  epsilon(): string {
    return "epsilon";
  }
}
