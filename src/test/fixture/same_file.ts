export interface BaseInterface {
  delta: string;
  epsilon(): string;
}

export class BaseClass {
  constructor() {
    // nothing
  }

  public alpha = "alpha";

  beta() {
    return "beta";
  }
  public gamma() {
    return "gamma";
  }
}

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

  public get alpha() {
    return "zeta";
  }

  public get delta() {
    return "delta";
  }

  epsilon(): string {
    return "epsilon";
  }
}
