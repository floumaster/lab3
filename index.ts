import { ClassDeclaration, MethodDeclaration, Project, PropertyDeclaration, SyntaxKind } from "ts-morph";

const project = new Project({
  tsConfigFilePath: './tsconfig.json'
});

const sourceFile = project.getSourceFileOrThrow('./test.ts');

const classes = sourceFile.getClasses()

const checkAreMethodsEqual = (method1: MethodDeclaration, method2: MethodDeclaration) => {
  return method1.getName() === method2.getName()
}

const checkAreAttributesEqual = (attribute1: PropertyDeclaration, attribute2: PropertyDeclaration) => {
  return attribute1.getName() === attribute2.getName()
}

const getLocalMethods = (classDeclaration: ClassDeclaration) => {
  return classDeclaration.getMethods()
}

const getLocalAttributes = (classDeclaration: ClassDeclaration) => {
  return classDeclaration.getProperties()
}

const getInheritanceDepth = (classDeclaration: ClassDeclaration) => {
  let depth = 0
  let currentClass = classDeclaration;
  while (currentClass.getBaseClass()) {
    depth++
    const baseClass = currentClass.getBaseClass()
    if(baseClass) {
      currentClass = baseClass;
    }
  }
  return depth
}

const getInheritedMethods = (classDeclaration: ClassDeclaration) => {
  const methods: MethodDeclaration[] = []
  let currentClass = classDeclaration;
  while (currentClass.getBaseClass()) {
    const baseClass = currentClass.getBaseClass()
    if(baseClass) {
      methods.push(...getLocalMethods(baseClass).filter(method => methods.every(method2 => !checkAreMethodsEqual(method, method2))))
      currentClass = baseClass;
    }
  }
  return methods
}

const getInheritedAttributes = (classDeclaration: ClassDeclaration) => {
  const attributes: PropertyDeclaration[] = []
  let currentClass = classDeclaration;
  while (currentClass.getBaseClass()) {
    const baseClass = currentClass.getBaseClass()
    if(baseClass) {
      attributes.push(...getLocalAttributes(baseClass).filter(attribute => attributes.every(attribute2 => !checkAreAttributesEqual(attribute, attribute2))))
      currentClass = baseClass;
    }
  }
  return attributes
}

const getOverridenMethods = (classDeclaration: ClassDeclaration) => {
  const classMethods = getLocalMethods(classDeclaration)
  const inheritedMethods = getInheritedMethods(classDeclaration)
  return classMethods.filter(classMethod => inheritedMethods.some(inheritedMethod => checkAreMethodsEqual(classMethod, inheritedMethod))) 
}

const getNewMethods = (classDeclaration: ClassDeclaration) => {
  const classMethods = getLocalMethods(classDeclaration)
  const overridenMethods = getOverridenMethods(classDeclaration)
  return classMethods.filter(classMethod => overridenMethods.every(overridenMethod => !checkAreMethodsEqual(classMethod, overridenMethod))) 
}

const getClassChildrenNumber = (classDeclaration: ClassDeclaration) => {
  return classDeclaration.getDerivedClasses().length
}

const getInheritedByDefaultMethods = (classDeclaration: ClassDeclaration) => {
  const classMethods = getLocalMethods(classDeclaration)
  const inheritedMethods = getInheritedMethods(classDeclaration)
  return inheritedMethods.filter(inheritedMethod => classMethods.every(classMethod => !checkAreMethodsEqual(inheritedMethod, classMethod))) 
}

const getAllMethods = (classDeclaration: ClassDeclaration) => {
  return [...classDeclaration.getMethods(), ...getInheritedByDefaultMethods(classDeclaration)]
}

const getAllPrivateMethods = (classDeclaration: ClassDeclaration) => {
  return getAllMethods(classDeclaration).filter(method => method.getModifiers().some(modifier => modifier.getKind() === SyntaxKind.PrivateKeyword));
}

const getInheritedByDefaultAttributeNames = (classDeclaration: ClassDeclaration) => {
  const classAttributes = getLocalAttributes(classDeclaration)
  const inheritedAttributes = getInheritedAttributes(classDeclaration)
  return inheritedAttributes.filter(inheritedAttribute => classAttributes.every(classAttribute => !checkAreAttributesEqual(classAttribute, inheritedAttribute))) 
}

const getAllPrivateProperties = (classDeclaration: ClassDeclaration) => {
  return getLocalAttributes(classDeclaration).filter(attribute => attribute.getModifiers().some(modifier => modifier.getKind() === SyntaxKind.PrivateKeyword));
}

const processClasses = (
  classes: ClassDeclaration[],
  numeratorFunc: (prop: any) => number,
  denominatorFunc: (prop: any) => number
) => {
  let numeratorSum = 0
  let denominatorSum = 0
  classes.forEach(classDeclaration => {
    numeratorSum += numeratorFunc(classDeclaration)
    denominatorSum += denominatorFunc(classDeclaration)
  })
  return numeratorSum/denominatorSum
}


const mif = processClasses(classes, (classDeclaration: ClassDeclaration) => getInheritedByDefaultMethods(classDeclaration).length, (classDeclaration: ClassDeclaration) => getAllMethods(classDeclaration).length)
const mhf = processClasses(classes, (classDeclaration: ClassDeclaration) => getAllPrivateMethods(classDeclaration).length, (classDeclaration: ClassDeclaration) => getAllMethods(classDeclaration).length)
const ahf = processClasses(classes, (classDeclaration: ClassDeclaration) => getAllPrivateProperties(classDeclaration).length, (classDeclaration: ClassDeclaration) => getLocalAttributes(classDeclaration).length)
const aif = processClasses(classes, (classDeclaration: ClassDeclaration) => getInheritedByDefaultAttributeNames(classDeclaration).length, (classDeclaration: ClassDeclaration) => getLocalAttributes(classDeclaration).length)
const pof = processClasses(classes, (classDeclaration: ClassDeclaration) => getOverridenMethods(classDeclaration).length, (classDeclaration: ClassDeclaration) => (
  getNewMethods(classDeclaration).length * getClassChildrenNumber(classDeclaration)
))

classes.forEach(classDeclaration => {
  console.log(`
Class name: ${classDeclaration.getName()}
Depth: ${getInheritanceDepth(classDeclaration)}
Number of children: ${getClassChildrenNumber(classDeclaration)}
`)
})

console.log(`
mif: ${mif}
mhf: ${mhf}
ahf: ${ahf}
aif: ${aif}
pof: ${pof}
`)

