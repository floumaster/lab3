class first {
  public firstMethod() {
    return
  }

  public secondtMethod() {
    return
  }

  public someAttr = 0
}

class second extends first {

  override secondtMethod() {
    return
  }

  public someAttr2 = 0
  private privateProp = 231
}

class third extends second {

  private thirdtMethod() {
    return
  }
}

class qwerty extends first {}

class extra extends second {
  override firstMethod() {
    return
  }

  private someMethod() {

  }

  private someProp = '-'
}

