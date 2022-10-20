# come-right-now-backend

[지금갈게] 실시간 예약 서비스 backend 레포지토리

---

## 기술 스택

### Backend

- Node.js
- Typescript
- NestJS
- Socket.io
- JWT
- TypeORM

### Database

- MySQL
- Redis

### Cloud/Infra

- EC2
- S3
- CloudFront
- ELB
- Route53
- RDS
- Elasticache

### Testing/Monitering

- Jest
- Artillery
- NewRelic

### Communication / Ect.

- Jira Software
- Notion
- Github
- draw.io
- Webex
- ERD Cloud

---

## ER 다이어그램

![Copy of come-right-now-erd](https://user-images.githubusercontent.com/55343124/196993157-aa3bc70a-adf9-48fb-9ac0-98fb7083287e.png)

---

## API 명세서

- API 및 Websocket Event 문서
  https://plausible-forsythia-06e.notion.site/API-986b66b2f3d04943b938d8ea80b95268
- Swagger
  http://devserver.jigeumgo.com/api

---

## 시스템 구성도

![_지금갈게 시스템구성도(중간) - README drawio](https://user-images.githubusercontent.com/55343124/195806415-ab92a44e-b149-4c8a-a0c2-1e0e36e51d1e.png)

---

## CI/CD 플로우 다이어그램

![지금갈게_CI_CD drawio](https://user-images.githubusercontent.com/55343124/196998492-2d625121-ff14-48c6-9234-e41371b3a01f.png)

---

## 브랜치 전략

### Gitlab-flow

배포, 개발, 그사이에 staging 브랜치를 두는 전략

![다운로드](https://user-images.githubusercontent.com/55343124/196999605-a6eba4e9-9dc3-47d3-887e-5961b8c5ab6d.png)

- Develop
  - 개발 브랜치. 피쳐 개발 시 포크 후 PR을 develop브랜치에 날려 진행한다.
  - 전체적인 테스트 후 기능이 보장되면 staging branch로 머지한다.
- Staging
  - 개발-배포 사이에 변경사항을 바로 배포하지 않고 test server에 배포하고 QA테스트를 수행하며 시간을 두고 master브랜치에 반영하는 브랜치
  - 테스트 후 배포할 준비가 되면 master브랜치에 머지한다.
- Master
  - 테스트가 끝난 후 실제 배포하기위한 브랜치

1. local에 repository clone
2. 개발 feature 브랜치 작성
   - ex) feature/findStore
3. 개발 후 develop 브랜치에 PR (git push origin feature/findStore)
4. 코드리뷰 후 리뷰어가 머지
5. 머지 후 원격 feature 브랜치 제거, 로컬 feature 브랜치 제거
6. QA 테스트 후 Production 브랜치에 머지

---

## 커밋 컨벤션

<유다시티 커밋 컨벤션>

### 커밋 메시지 구조

각 파트 사이에 엔터 하나를 둔다.

```jsx
<type>: <subject> (#<ISSUE>)

body(optional)
```

#### <Type>: <Subject> (#<Issue>)

<태그>: <제목> 순서로 기입(”:” 뒤에만 스페이스 남긴다.). 태그의 첫글자는 대문자로 쓴다. Subject에 마침표 찍지 않는다. 맨 뒤 괄호에 지라 이슈 ID를 기입한다.

- Feat: 새로운 기능 추가, 기능 로직 변경
- Fix: 버그 수정
- Docs: 문서 수정, 주석
- Style: 코드 포맷팅, 코드 변경이 없는 경우
- Refactor: 코드 리팩토링 (기능 변화 X)
- Test: 테스트코드 추가
- Chore: 빌드 업무 수정, 패키지 매니저 수정

#### Body(optional)

커밋에 대한 설명을 작성한다. 없어도 무방하다. 한줄 당 72자 내로 작성한다(그 이상은 엔터 후 작성). 무엇을 변경했는지, 왜 변경했는지를 작성한다.

#### 커밋 예시

```jsx
Feat: 회원 가입 기능 구현 (#WTD-18)

아이디 중복검사, 비밀번호 유효성검사 개발
```

<img width="314" alt="스크린샷_2022-06-29_오후_4 14 07" src="https://user-images.githubusercontent.com/55343124/195807384-b20a49f4-2c54-4a2c-a6a0-62cc24116773.png">

