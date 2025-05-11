## 일반 인스턴스화
```node

class A {
	const b = B();//매번 인스턴스가 생성된다.
}

class B{

}
```
### 클래스 A가 클래스 B의 기능을 다음과 같이 사용할 경우 생기는 이슈
- 매번 인스턴스를 만들어야 한다.
- 여러 클래스에서 클래스 B를 사용해야 하는 경우 매번 다른 인스턴스인 클래스 B를 사용하게 된다.
- 매번 다른 인스턴스 B를 생성하는 과정에서 버그 가능성.

## Dependency Injection

```node
class A {
	constructor(instance: B)//
}

class B{

}

//다른곳에서 인스턴스 B 생성
const instanceB = new B()
const instanceA = new A(instanceB)
const instanceC = new C(instanceB)
```
## 생성자 안에 클래스 B 인스턴스를 넣어주는 방법
- 모든 클래스를 생성자에서 받으면 같은 인스턴스를 사용할 수 있다.
- 인스턴스화는 A나 B가 아닌 다른곳에서 실행되어 생성된다.
- 우리가 직접 클래스 B를 인스턴스해서 A에 넣어주는 것 또한 불편하다.

## Inversion of Control
```node
//Ioc container
//여기에서 클래스 B를 알아서 인스턴스화해서 A, C에 넣어준다.
class B{

}
////////

class A {
	constructor(instance: B) //내가 직접 인스턴스 B를 생성하지 않아도 된다.
}

class C {
	constructor(instance: B) //내가 직접 인스턴스 B를 생성하지 않아도 된다.
}

```

## 의존성 역전
제어의 주체를 역전시킨다.

## IoC and DI
NestJs IoC Container
```node
//IoC Container
//instance b
class B{}
new B()

//instance c
class C{}
new C()

///////////

class A {
	constructor(instance: B) //내가 직접 인스턴스 B를 생성하지 않아도 된다.
}

class C {
	constructor(instance: B) //내가 직접 인스턴스 B를 생성하지 않아도 된다.
}

```
- 선언해놓은 클래스들로 자동으로 인스턴스를 생성한다.
- 모듈 안 프로바이더에 넣은 클래스들로 자동으로 인스턴스를 생성한다.
- 생성도 자동으로, 주입도 자동으로 해준다.

@Injectable()
- IoC에서 관리하는 클래스를 가르키는 어노테이션

Decorator that marks a class as a provider . Providers can be injected into other classes via constructor parameter injection using Nest's built-in Dependency Injection (DI)  system.
