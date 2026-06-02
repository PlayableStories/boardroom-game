# Title

Boardroom

# Meters

| ID | Icon | Name |
|---|---|---|
| shareholders | 💰 | Shareholders |
| management | 🏢 | Management |
| staff | 😊 | Staff |
| image | 🌍 | Public Image |

# Characters

| ID | Name | Role | Initials |
|---|---|---|---|
| the-chair | The Chair | Board Representative | CH |
| the-hr-director | The HR Director | People Operations | HR |
| the-journalist | The Journalist | External Pressure | JN |
| the-legal-counsel | The Legal Counsel | Corporate Legal | LC |
| the-cfo | The CFO | Finance | CF |
| the-head-of-engineering | The Head of Engineering | Engineering Division | EG |
| the-head-of-rd | The Head of R&D | Research & Development | RD |
| the-head-of-operations | The Head of Operations | Operations | OP |
| the-regulator | The Regulator | Government Authority | RG |
| the-whistleblower | The Whistleblower | Anonymous Employee | WH |
| the-ceo | The CEO | Chief Executive | CE |

# Endings

## shareholders_0 — Hostile Takeover

The board accepted the acquisition offer. You were not part of the deal.

## shareholders_100 — Bubble Burst

The investigation began on a Tuesday. By Thursday, you were trending.

## management_0 — Board Coup

A unanimous vote. They didn't even tell you in person.

## management_100 — Autocracy

They all left on the same day. Nobody sent a resignation email.

## staff_0 — Great Resignation

The offices emptied in three weeks. The ping-pong table remained.

## staff_100 — Quiet Quitting

Everyone smiled. Nobody worked. The quarterly targets were missed by 40%.

## image_0 — PR Collapse

The hashtag trended for nine days. The advertisers left on day two.

## image_100 — Overexposure

The documentary was actually very well made. That was the problem.

## deck_exhaust — Out of Crises

You ran out of cards. The world ran out of patience.

# UI

| Key | Text |
|---|---|
| playAgain | Play Again |
| youLastedSingular | You lasted 1 card. |
| youLastedPlural | You lasted {n} cards. |
| leftGlyph | ✕ |
| rightGlyph | ✓ |

# Cards

## bro-001

- **Type**: character
- **Arc**: bro_culture
- **Character**: the-hr-director

> An engineer has filed a harassment complaint against her team lead. He's one of our best performers. HR recommends quietly moving her to another division to avoid disruption.

### Left → Approve the transfer

- shareholders: +5
- management: 0
- staff: -15
- image: 0
- Plants bomb: bro-bomb-001 after 8 cards

### Right → Investigate properly

- shareholders: -8
- management: 0
- staff: +12
- image: +10

*The transfer was approved. She moved teams. He got a performance bonus.*

## bro-bomb-001

- **Type**: bomb
- **Arc**: bro_culture
- **Character**: the-journalist

> A former employee has published a detailed account of systemic harassment at the company. It's going viral. The board is calling for an emergency governance review.

### Left → Deny and discredit her

- shareholders: +5
- management: +5
- staff: -20
- image: -25
- Plants bomb: bro-bomb-002 after 5 cards

### Right → Commission external review

- shareholders: -5
- management: -15
- staff: +15
- image: +12
- Unlocks chain: bro-chain-001

*We had absolutely no idea this was happening.*

## bro-bomb-002

- **Type**: bomb
- **Arc**: bro_culture
- **Character**: the-journalist

> Fourteen more women have come forward. The original engineer has a primetime interview airing tomorrow. Three Fortune 500 advertisers have already pulled their accounts pending an internal investigation. Communications wants a position before the segment runs.

### Left → Public statement of denial

- shareholders: -15
- management: +5
- staff: -25
- image: -30

### Right → Quiet settlement and apology

- shareholders: -22
- management: -10
- staff: +10
- image: +8

*The interview aired. The denial aired thirty minutes later. Both clips trended together.*

## bro-chain-001

- **Type**: chain
- **Arc**: bro_culture
- **Character**: the-chair
- **Chain parent**: bro-bomb-001

> The external review recommends stripping the CEO of certain powers and restructuring the board. Five investors have written asking you to step aside temporarily. Will you?

### Left → Refuse to step back

- shareholders: -20
- management: -25
- staff: -5
- image: -10

### Right → Take a leave of absence

- shareholders: +5
- management: -12
- staff: +8
- image: +15

*He called it 'Travis 2.0.' Nobody used that phrase unironically.*

## theranos-001

- **Type**: character
- **Arc**: fake_it
- **Character**: the-head-of-rd

> Our core product doesn't work as advertised yet. The lab chief says we need 18 more months. The sales team has already promised clients it's live. What do we tell the investors at next week's demo?

### Left → Stage a convincing demo

- shareholders: +20
- management: +5
- staff: -10
- image: +8
- Plants bomb: theranos-bomb-001 after 10 cards

### Right → Disclose the delay

- shareholders: -18
- management: -5
- staff: +10
- image: +12

*Fake it till you make it works until it becomes wire fraud.*

## theranos-002

- **Type**: character
- **Arc**: fake_it
- **Character**: the-legal-counsel

> Two junior lab employees have raised ethical concerns internally. They've been asking too many questions about the product data. Legal recommends they sign enhanced NDAs. One is the grandson of a board member.

### Left → NDA them both

- shareholders: +8
- management: +10
- staff: -18
- image: 0
- Plants bomb: theranos-bomb-001 after 6 cards

### Right → Hear them out

- shareholders: -5
- management: -8
- staff: +15
- image: +5

*Silencing a board member's grandson never ends quietly.*

## theranos-bomb-001

- **Type**: bomb
- **Arc**: fake_it
- **Character**: the-whistleblower

> A former employee has gone to a regulatory body. The agency is requesting access to all lab records from the last three years. Legal says we have 48 hours before it becomes a formal investigation.

### Left → Cooperate fully

- shareholders: -18
- management: -10
- staff: +8
- image: +15

### Right → Delay and lawyer up

- shareholders: -25
- management: -5
- staff: -5
- image: -30

*The regulator wasn't the last problem. The journalist already had the documents.*

## boeing-001

- **Type**: character
- **Arc**: safety_shortcut
- **Character**: the-cfo

> We're 8 months behind our competitor's new model launch. Engineering says adding the redundancy failsafe will cost $90m and delay delivery by 6 months. Finance recommends proceeding without it — the risk is 'within acceptable limits.'

### Left → Approve the shortcut

- shareholders: +20
- management: +5
- staff: -8
- image: 0
- Plants bomb: boeing-bomb-001 after 10 cards

### Right → Fund the failsafe

- shareholders: -18
- management: -5
- staff: +12
- image: +10

*'Within acceptable limits' aged very badly.*

## boeing-002

- **Type**: character
- **Arc**: safety_shortcut
- **Character**: the-head-of-engineering

> An engineer has submitted a formal ethics complaint. He says the system's single-sensor design will fail under a specific rare condition. He wants a safety review before ship. The product launches in three weeks.

### Left → Override and ship

- shareholders: +15
- management: +8
- staff: -20
- image: 0
- Plants bomb: boeing-bomb-001 after 7 cards

### Right → Delay and review

- shareholders: -20
- management: -5
- staff: +18
- image: +8

*39% of employees felt undue pressure not to raise concerns. The survey existed. No one acted on it.*

## boeing-bomb-001

- **Type**: bomb
- **Arc**: safety_shortcut
- **Character**: the-regulator

> A catastrophic product failure has made headlines worldwide. Regulators have grounded the entire fleet pending review. The CEO has been subpoenaed to testify before a government committee. The board was not informed for ten days.

### Left → Defend the product publicly

- shareholders: -30
- management: -10
- staff: -10
- image: -35

### Right → Acknowledge and cooperate

- shareholders: -20
- management: -18
- staff: +5
- image: +12

*The CEO called the product safe in a phone call with the President. The planes stayed grounded for 20 months.*

## boeing-quarterly-001

- **Type**: quarterly
- **Arc**: safety_shortcut
- **Character**: the-chair

> Quarterly review. Delivery numbers are ahead of plan, but three internal incident reports have been escalated to the board. The Chair wants to know whether you'll continue to defend the current production cadence — or whether you'll authorize a six-week safety audit that will miss this quarter's targets.

### Left → Hold the cadence

- shareholders: +12
- management: +8
- staff: -15
- image: -10

### Right → Pause for the audit

- shareholders: -18
- management: -5
- staff: +18
- image: +10

*The Chair noted your answer for the minutes. The minutes leak quarterly.*

## wework-001

- **Type**: character
- **Arc**: cult_of_growth
- **Character**: the-cfo

> We're burning $500m a year with no path to profitability. The founder wants to spend $12m on a private jet lease and expand into 15 new cities. The CFO says we need to discuss sustainability. The founder says 'vision over metrics.'

### Left → Approve everything

- shareholders: -10
- management: +15
- staff: +10
- image: +12
- Plants bomb: wework-bomb-001 after 8 cards

### Right → Set spending limits

- shareholders: +12
- management: -15
- staff: -5
- image: -5

*He also sold the rights to his own company's name back to it. The lawyers said it was legal.*

## wework-002

- **Type**: character
- **Arc**: cult_of_growth
- **Character**: the-chair

> The IPO prospectus has been leaked. Media are calling the valuation delusional. Two major institutional investors are threatening to pull out. The board wants you to remove the founder from the CEO role before filing.

### Left → Back the founder

- shareholders: -25
- management: +12
- staff: +5
- image: -8
- Plants bomb: wework-bomb-001 after 4 cards

### Right → Remove the founder

- shareholders: +15
- management: -20
- staff: -10
- image: +5
- Unlocks chain: wework-chain-001

*He walked away with $1.05 billion. Thousands of employees lost their jobs.*

## wework-chain-001

- **Type**: chain
- **Arc**: cult_of_growth
- **Character**: the-hr-director
- **Chain parent**: wework-002

> After the restructuring, we need to lay off 2,400 staff. HR proposes a severance package and public town hall. Finance says announce it quietly via email on a Friday afternoon.

### Left → Friday email, keep it quiet

- shareholders: +5
- management: +5
- staff: -28
- image: -20

### Right → Town hall and severance

- shareholders: -10
- management: -5
- staff: +15
- image: +12

*The Friday email always leaks by Saturday. This one leaked by Friday evening.*

## wework-bomb-001

- **Type**: bomb
- **Arc**: cult_of_growth
- **Character**: the-chair

> The IPO has been withdrawn. Two lead underwriters have stepped back, the valuation has been cut by 80% overnight, and a private equity firm is offering an emergency rescue package — on the condition that the founder leaves with nothing. The board needs an answer by morning.

### Left → Refuse the rescue terms

- shareholders: -30
- management: +10
- staff: -15
- image: -15

### Right → Accept the rescue, founder out

- shareholders: +8
- management: -20
- staff: +5
- image: +10

*The press release said it was a 'strategic refocus.' The 9-figure exit package said otherwise.*

## vw-001

- **Type**: character
- **Arc**: defeat_device
- **Character**: the-head-of-engineering

> Our emissions system can't meet regulatory standards at the required cost. Engineering proposes software that performs correctly during lab testing only. It would save $200m and preserve our green marketing position. This stays between us.

### Left → Approve the software

- shareholders: +25
- management: +8
- staff: -5
- image: +10
- Plants bomb: vw-bomb-001 after 12 cards

### Right → Redesign properly

- shareholders: -20
- management: -5
- staff: +10
- image: +12

*Senior executives knew by 2007. The cover-up lasted eight years.*

## vw-chain-001

- **Type**: chain
- **Arc**: defeat_device
- **Character**: the-legal-counsel
- **Chain parent**: vw-001
- **Chain trigger**: left

> Regulators have requested our engine certification data. Legal says the software will be discovered during inspection. They recommend destroying the relevant test records before the formal investigation begins.

### Left → Preserve and disclose

- shareholders: -20
- management: -18
- staff: +5
- image: +8

### Right → Delete the records

- shareholders: -35
- management: -20
- staff: -10
- image: -35

*Eight engineers received the message. All of them deleted the data. Some of it was recovered anyway.*

## vw-bomb-001

- **Type**: bomb
- **Arc**: defeat_device
- **Character**: the-journalist

> An independent research team has published findings that your product emits 40x the legal limit in real-world conditions. The story is on the front page globally. Regulators in three countries are opening investigations simultaneously.

### Left → Issue a full apology

- shareholders: -25
- management: -15
- staff: +5
- image: +10

### Right → Claim it's a testing anomaly

- shareholders: -20
- management: -5
- staff: -5
- image: -35

*The fine was $4.3 billion. The cover-up cost more than fixing the problem would have.*

## surveillance-001

- **Type**: character
- **Arc**: productivity_machine
- **Character**: the-head-of-operations

> Our new AI workforce monitoring system tracks toilet breaks, typing speed, and mouse movement in real time. Productivity is up 18%. Injury rates are also up 40%. Operations wants to roll it out company-wide.

### Left → Full company-wide rollout

- shareholders: +20
- management: +10
- staff: -25
- image: -5
- Plants bomb: surveillance-bomb-001 after 7 cards

### Right → Cap it at pilot sites

- shareholders: -8
- management: 0
- staff: +12
- image: +10

*'It kind of feels like prison.' — actual warehouse employee, on record.*

## surveillance-002

- **Type**: character
- **Arc**: productivity_machine
- **Character**: the-ceo

> We're mandating five-day office attendance for all corporate staff, effective next quarter. No exceptions. The comms team says it will trigger a talent exodus among senior engineers. Do you send the announcement as written?

### Left → Send it as written

- shareholders: +8
- management: +20
- staff: -22
- image: -8
- Plants bomb: surveillance-bomb-001 after 5 cards

### Right → Offer a hybrid option

- shareholders: -5
- management: -12
- staff: +15
- image: +10

*'What's going to motivate you more: a ping-pong table, or avoiding two hours in rush-hour traffic?'*

## surveillance-bomb-001

- **Type**: bomb
- **Arc**: productivity_machine
- **Character**: the-regulator

> A government investigation has found our employee monitoring system 'excessively intrusive' in violation of data protection law. A €32m fine is proposed. The regulator wants public evidence of a full policy overhaul within 60 days.

### Left → Contest the fine in court

- shareholders: -10
- management: +5
- staff: -12
- image: -20

### Right → Pay and reform publicly

- shareholders: -15
- management: -10
- staff: +15
- image: +18

*The Time Off Task timer continued tracking bathroom breaks throughout the investigation.*

## quarterly-board-review

- **Type**: quarterly
- **Arc**: general
- **Character**: the-chair

> Quarterly board review. The numbers have been distributed. Several non-executive directors want a closed-session conversation about your leadership style. Do you stay for the difficult part of the meeting, or excuse yourself so they can speak freely?

### Left → Stay in the room

- shareholders: -5
- management: +12
- staff: 0
- image: -5

### Right → Step out

- shareholders: +5
- management: -10
- staff: +5
- image: +8

*The 'closed session' lasted three hours. Nobody told you what was said.*
