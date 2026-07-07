// Bundled default bank: all five realm CSVs (content/R1-R5-questions.csv) run through the shared parser.
// Regenerate after editing any CSV — never hand-edit.
export const SAMPLE_QUESTIONS = [
 {
  "question": "A circuit has continuity when…",
  "choices": [
   "There is a complete, unbroken path for current",
   "The wire is copper",
   "The breaker is oversized"
  ],
  "answer": "There is a complete, unbroken path for current",
  "why": "No complete path, no current — continuity is the first thing to check.",
  "difficulty": "easy",
  "category": "CIRC",
  "skin": "both"
 },
 {
  "question": "An open circuit means…",
  "choices": [
   "No current flows",
   "Maximum current flows",
   "The voltage doubles"
  ],
  "answer": "No current flows",
  "why": "An open is a break in the path — the circuit does nothing until it's closed.",
  "difficulty": "easy",
  "category": "CIRC",
  "skin": "both"
 },
 {
  "question": "In a series circuit, a break anywhere means…",
  "choices": [
   "Everything loses power",
   "Only the last load loses power",
   "Nothing changes"
  ],
  "answer": "Everything loses power",
  "why": "Series loads share one path — one break opens the whole circuit.",
  "difficulty": "easy",
  "category": "CIRC",
  "skin": "theory"
 },
 {
  "question": "Ohm's law says current equals…",
  "choices": [
   "Voltage divided by resistance",
   "Voltage times resistance",
   "Resistance divided by voltage"
  ],
  "answer": "Voltage divided by resistance",
  "why": "I = V/R. Less resistance or more voltage means more current.",
  "difficulty": "easy",
  "category": "CIRC",
  "skin": "theory"
 },
 {
  "question": "Electrical power in watts equals…",
  "choices": [
   "Volts times amps",
   "Volts plus amps",
   "Amps divided by volts"
  ],
  "answer": "Volts times amps",
  "why": "P = V × I. A 120 V load drawing 10 A uses 1200 W.",
  "difficulty": "easy",
  "category": "CIRC",
  "skin": "theory"
 },
 {
  "question": "A short circuit is…",
  "choices": [
   "An unintended very-low-resistance path",
   "A run under 10 feet",
   "A circuit with a small breaker"
  ],
  "answer": "An unintended very-low-resistance path",
  "why": "Low resistance means huge current — that's why protection has to open fast.",
  "difficulty": "medium",
  "category": "CIRC",
  "skin": "both"
 },
 {
  "question": "In a parallel circuit, each branch…",
  "choices": [
   "Gets the full source voltage",
   "Splits the voltage equally",
   "Must have the same resistance"
  ],
  "answer": "Gets the full source voltage",
  "why": "Branch circuits are parallel — every load sees the same supply voltage.",
  "difficulty": "medium",
  "category": "CIRC",
  "skin": "theory"
 },
 {
  "question": "The unit of electrical current is the…",
  "choices": [
   "Ampere",
   "Volt",
   "Watt"
  ],
  "answer": "Ampere",
  "why": "Amps measure how much charge flows per second — current is the flow itself.",
  "difficulty": "easy",
  "category": "CIRC",
  "skin": "theory"
 },
 {
  "question": "The unit of electrical resistance is the…",
  "choices": [
   "Ohm",
   "Amp",
   "Joule"
  ],
  "answer": "Ohm",
  "why": "Resistance in ohms is how hard a material fights current flow.",
  "difficulty": "easy",
  "category": "CIRC",
  "skin": "theory"
 },
 {
  "question": "Voltage is best described as…",
  "choices": [
   "The electrical pressure that pushes current through a circuit",
   "The speed of the electrons",
   "The thickness of the wire"
  ],
  "answer": "The electrical pressure that pushes current through a circuit",
  "why": "Voltage is potential difference — the push; current only flows when a path lets it.",
  "difficulty": "easy",
  "category": "CIRC",
  "skin": "theory"
 },
 {
  "question": "A switch turns a load off by…",
  "choices": [
   "Opening the circuit path",
   "Absorbing the current",
   "Lowering the voltage to half"
  ],
  "answer": "Opening the circuit path",
  "why": "A switch is just a controlled open — break the path, stop the current.",
  "difficulty": "easy",
  "category": "CIRC",
  "skin": "theory"
 },
 {
  "question": "Which material is a conductor?",
  "choices": [
   "Copper",
   "Rubber",
   "Glass"
  ],
  "answer": "Copper",
  "why": "Metals like copper let current flow freely; rubber and glass are insulators.",
  "difficulty": "easy",
  "category": "CIRC",
  "skin": "theory"
 },
 {
  "question": "In circuit terms, a load is…",
  "choices": [
   "A device that converts electrical energy into light, heat, or motion",
   "The wire between outlets",
   "The service panel"
  ],
  "answer": "A device that converts electrical energy into light, heat, or motion",
  "why": "Lamps, motors, heaters — the load is where the energy does useful work.",
  "difficulty": "easy",
  "category": "CIRC",
  "skin": "theory"
 },
 {
  "question": "Current flows in a circuit only when…",
  "choices": [
   "The path is closed and complete",
   "The wire is brand new",
   "The breaker is oversized"
  ],
  "answer": "The path is closed and complete",
  "why": "A closed loop from source through load and back — that is the whole game.",
  "difficulty": "easy",
  "category": "CIRC",
  "skin": "theory"
 },
 {
  "question": "In a series circuit, the current…",
  "choices": [
   "Is the same through every component",
   "Splits between the loads",
   "Is zero at the last load"
  ],
  "answer": "Is the same through every component",
  "why": "One path means one current — every series element carries the identical amps.",
  "difficulty": "medium",
  "category": "CIRC",
  "skin": "theory"
 },
 {
  "question": "Two identical lamps in series across 120 V each see…",
  "choices": [
   "60 V",
   "120 V",
   "240 V"
  ],
  "answer": "60 V",
  "why": "Series voltage divides between loads — equal loads split it equally.",
  "difficulty": "medium",
  "category": "CIRC",
  "skin": "theory"
 },
 {
  "question": "A circuit draws 2 A from a 120 V source. Its resistance is…",
  "choices": [
   "60 ohms",
   "240 ohms",
   "0.6 ohms"
  ],
  "answer": "60 ohms",
  "why": "R = V / I = 120 / 2 = 60 — Ohm's law rearranged.",
  "difficulty": "medium",
  "category": "CIRC",
  "skin": "theory"
 },
 {
  "question": "If resistance increases while voltage stays the same, current…",
  "choices": [
   "Decreases",
   "Increases",
   "Stays the same"
  ],
  "answer": "Decreases",
  "why": "I = V/R — more opposition, less flow.",
  "difficulty": "medium",
  "category": "CIRC",
  "skin": "theory"
 },
 {
  "question": "A continuity test must be done…",
  "choices": [
   "With the circuit de-energized",
   "On a live circuit",
   "Only outdoors"
  ],
  "answer": "With the circuit de-energized",
  "why": "The meter supplies its own tiny test current — live voltage gives false readings and can wreck the meter.",
  "difficulty": "medium",
  "category": "CIRC",
  "skin": "theory"
 },
 {
  "question": "Homes wire receptacles in parallel so that…",
  "choices": [
   "Each device gets full voltage and works independently",
   "The wire can be thinner",
   "The breaker never trips"
  ],
  "answer": "Each device gets full voltage and works independently",
  "why": "Parallel branches run independently — one lamp out does not kill the room.",
  "difficulty": "medium",
  "category": "CIRC",
  "skin": "theory"
 },
 {
  "question": "A 60 W lamp on a 120 V circuit draws…",
  "choices": [
   "0.5 A",
   "2 A",
   "60 A"
  ],
  "answer": "0.5 A",
  "why": "I = P / V = 60 / 120 = 0.5 A — power math in reverse.",
  "difficulty": "medium",
  "category": "CIRC",
  "skin": "theory"
 },
 {
  "question": "If one branch of a parallel circuit opens, the other branches…",
  "choices": [
   "Keep operating normally",
   "All shut down",
   "Double their current"
  ],
  "answer": "Keep operating normally",
  "why": "Each parallel branch has its own path — an open only kills its own branch.",
  "difficulty": "medium",
  "category": "CIRC",
  "skin": "theory"
 },
 {
  "question": "A voltmeter is connected across a component because it measures…",
  "choices": [
   "The potential difference between two points",
   "The current through the wire",
   "The wire temperature"
  ],
  "answer": "The potential difference between two points",
  "why": "Voltage is always measured between two points — across, never in line.",
  "difficulty": "medium",
  "category": "CIRC",
  "skin": "theory"
 },
 {
  "question": "In a parallel circuit, current flows through…",
  "choices": [
   "Every branch, with more in the lower-resistance branches",
   "Only the path of least resistance",
   "Only the first branch"
  ],
  "answer": "Every branch, with more in the lower-resistance branches",
  "why": "The least-resistance saying is a myth — every path carries its share, inversely to resistance.",
  "difficulty": "medium",
  "category": "CIRC",
  "skin": "theory"
 },
 {
  "question": "Two 10-ohm resistors in series across 120 V draw…",
  "choices": [
   "6 A",
   "12 A",
   "3 A"
  ],
  "answer": "6 A",
  "why": "Series resistance adds: 20 ohms total, so I = 120 / 20 = 6 A.",
  "difficulty": "hard",
  "category": "CIRC",
  "skin": "theory"
 },
 {
  "question": "Two 10-ohm resistors in parallel have a combined resistance of…",
  "choices": [
   "5 ohms",
   "20 ohms",
   "10 ohms"
  ],
  "answer": "5 ohms",
  "why": "Equal resistors in parallel halve — more paths, less total resistance.",
  "difficulty": "hard",
  "category": "CIRC",
  "skin": "theory"
 },
 {
  "question": "An 1800 W space heater on a 120 V circuit draws…",
  "choices": [
   "15 A",
   "8 A",
   "30 A"
  ],
  "answer": "15 A",
  "why": "I = P / V = 1800 / 120 = 15 A — enough to max out a whole 15 A circuit.",
  "difficulty": "hard",
  "category": "CIRC",
  "skin": "theory"
 },
 {
  "question": "Adding another branch to a parallel circuit makes total source current…",
  "choices": [
   "Increase",
   "Decrease",
   "Stay exactly the same"
  ],
  "answer": "Increase",
  "why": "Each new branch lowers total resistance, so the source supplies more amps — how circuits get overloaded.",
  "difficulty": "hard",
  "category": "CIRC",
  "skin": "theory"
 },
 {
  "question": "In any series circuit, the sum of the voltage drops across the loads…",
  "choices": [
   "Equals the source voltage",
   "Is always zero",
   "Exceeds the source voltage"
  ],
  "answer": "Equals the source voltage",
  "why": "Kirchhoff's voltage law — the source's push is used up exactly around the loop.",
  "difficulty": "hard",
  "category": "CIRC",
  "skin": "theory"
 },
 {
  "question": "The total current leaving the source in a parallel circuit equals…",
  "choices": [
   "The sum of all branch currents",
   "The largest single branch current",
   "The smallest branch current"
  ],
  "answer": "The sum of all branch currents",
  "why": "Kirchhoff's current law — what leaves the source is the total of every branch.",
  "difficulty": "hard",
  "category": "CIRC",
  "skin": "theory"
 },
 {
  "question": "Doubling the voltage across a fixed resistance makes the power…",
  "choices": [
   "Four times greater",
   "Twice as great",
   "Half as great"
  ],
  "answer": "Four times greater",
  "why": "P = V squared over R — double the volts, quadruple the heat. Why small overvoltages matter.",
  "difficulty": "hard",
  "category": "CIRC",
  "skin": "theory"
 },
 {
  "question": "A short circuit can drive thousands of amps because…",
  "choices": [
   "Fault-path resistance is nearly zero, so I = V/R explodes",
   "The voltage rises sharply",
   "The wire becomes a better conductor when hot"
  ],
  "answer": "Fault-path resistance is nearly zero, so I = V/R explodes",
  "why": "Ohm's law with R near zero — only the system's tiny impedance limits the current.",
  "difficulty": "hard",
  "category": "CIRC",
  "skin": "theory"
 },
 {
  "question": "A toolbox talk is…",
  "choices": [
   "A short pre-task safety briefing",
   "A tool inventory",
   "A lunch break"
  ],
  "answer": "A short pre-task safety briefing",
  "why": "A few minutes of planning before the task prevents the incident during it.",
  "difficulty": "easy",
  "category": "GEN",
  "skin": "both"
 },
 {
  "question": "If you see an unsafe condition you should…",
  "choices": [
   "Stop work and report it",
   "Ignore it if you're busy",
   "Wait for the weekly meeting"
  ],
  "answer": "Stop work and report it",
  "why": "Everyone on site has stop-work authority — use it.",
  "difficulty": "easy",
  "category": "GEN",
  "skin": "both"
 },
 {
  "question": "In the hierarchy of controls, PPE is…",
  "choices": [
   "The last line of defense",
   "The most effective control",
   "A substitute for training"
  ],
  "answer": "The last line of defense",
  "why": "Eliminate or engineer out hazards first; PPE only limits what's left.",
  "difficulty": "easy",
  "category": "PPE",
  "skin": "both"
 },
 {
  "question": "A hard hat mainly protects you from…",
  "choices": [
   "Falling and swinging objects",
   "Sunburn",
   "Loud noise"
  ],
  "answer": "Falling and swinging objects",
  "why": "Head protection is required wherever overhead work or loads exist.",
  "difficulty": "easy",
  "category": "PPE",
  "skin": "both"
 },
 {
  "question": "In AWG sizes, a larger gauge number means…",
  "choices": [
   "A smaller conductor",
   "A bigger conductor",
   "A longer wire"
  ],
  "answer": "A smaller conductor",
  "why": "AWG runs backwards — 14 AWG is smaller than 12 AWG.",
  "difficulty": "medium",
  "category": "COND",
  "skin": "theory"
 },
 {
  "question": "Voltage drop on a long run is reduced by…",
  "choices": [
   "A larger conductor or a shorter run",
   "A bigger breaker",
   "More connections"
  ],
  "answer": "A larger conductor or a shorter run",
  "why": "Drop grows with length and shrinks with conductor size — keep runs short and sized right.",
  "difficulty": "medium",
  "category": "COND",
  "skin": "both"
 },
 {
  "question": "Too much voltage drop makes equipment…",
  "choices": [
   "Run hot and underperform",
   "Run faster",
   "Use less energy"
  ],
  "answer": "Run hot and underperform",
  "why": "Motors especially — low voltage means high current and heat.",
  "difficulty": "medium",
  "category": "COND",
  "skin": "theory"
 },
 {
  "question": "Wire splices and junctions must be made…",
  "choices": [
   "Inside an approved box",
   "Anywhere convenient",
   "Only with tape"
  ],
  "answer": "Inside an approved box",
  "why": "Boxes contain heat and faults and keep connections accessible.",
  "difficulty": "medium",
  "category": "COND",
  "skin": "theory"
 },
 {
  "question": "An extension cord for a high-amp tool must be…",
  "choices": [
   "Rated for at least the tool's current",
   "Any household cord",
   "As long as possible"
  ],
  "answer": "Rated for at least the tool's current",
  "why": "An undersized cord overheats and starves the tool with voltage drop.",
  "difficulty": "medium",
  "category": "COND",
  "skin": "both"
 },
 {
  "question": "Conductor ampacity is…",
  "choices": [
   "The current a conductor can carry continuously",
   "The length of the wire",
   "The voltage rating"
  ],
  "answer": "The current a conductor can carry continuously",
  "why": "Ampacity is a heat limit — exceed it and insulation cooks.",
  "difficulty": "medium",
  "category": "COND",
  "skin": "theory"
 },
 {
  "question": "The standard breaker rating for a 12 AWG copper branch circuit is…",
  "choices": [
   "20 A",
   "15 A",
   "30 A",
   "40 A"
  ],
  "answer": "20 A",
  "why": "12 AWG copper is protected at 20 A; 14 AWG at 15 A; 10 AWG at 30 A.",
  "difficulty": "medium",
  "category": "COND",
  "skin": "theory"
 },
 {
  "question": "A 15 A branch circuit needs copper wire at least…",
  "choices": [
   "14 AWG",
   "18 AWG",
   "22 AWG"
  ],
  "answer": "14 AWG",
  "why": "14 AWG copper for 15 A, 12 AWG for 20 A — the wire must match the breaker.",
  "difficulty": "hard",
  "category": "COND",
  "skin": "theory"
 },
 {
  "question": "The standard breaker rating for a 14 AWG copper branch circuit is…",
  "choices": [
   "15 A",
   "20 A",
   "30 A",
   "40 A"
  ],
  "answer": "15 A",
  "why": "14 AWG copper is protected at 15 A; 12 AWG at 20 A; 10 AWG at 30 A.",
  "difficulty": "hard",
  "category": "COND",
  "skin": "theory"
 },
 {
  "question": "The standard breaker rating for a 10 AWG copper branch circuit is…",
  "choices": [
   "30 A",
   "15 A",
   "20 A",
   "50 A"
  ],
  "answer": "30 A",
  "why": "10 AWG copper is protected at 30 A under the small-conductor rule.",
  "difficulty": "hard",
  "category": "COND",
  "skin": "theory"
 },
 {
  "question": "Which conductor can carry more current?",
  "choices": [
   "12 AWG copper",
   "14 AWG copper",
   "They are identical"
  ],
  "answer": "12 AWG copper",
  "why": "Lower AWG number means bigger wire and more ampacity: 12 AWG handles 20 A, 14 AWG only 15 A.",
  "difficulty": "easy",
  "category": "COND",
  "skin": "theory"
 },
 {
  "question": "Which metal is the better conductor at the same size?",
  "choices": [
   "Copper",
   "Aluminum",
   "Steel"
  ],
  "answer": "Copper",
  "why": "Copper carries more current per size — aluminum must be upsized to match.",
  "difficulty": "easy",
  "category": "COND",
  "skin": "theory"
 },
 {
  "question": "The main thing that destroys conductor insulation is…",
  "choices": [
   "Heat from carrying too much current",
   "Sunlight through windows",
   "Low voltage"
  ],
  "answer": "Heat from carrying too much current",
  "why": "Ampacity is a heat limit — chronic overheating cooks insulation long before anything trips.",
  "difficulty": "easy",
  "category": "COND",
  "skin": "theory"
 },
 {
  "question": "Conduit's main job is to…",
  "choices": [
   "Protect conductors from physical damage",
   "Boost the voltage",
   "Cool the wires below room temperature"
  ],
  "answer": "Protect conductors from physical damage",
  "why": "Raceways take the abrasion, impact, and crush so the insulation does not have to.",
  "difficulty": "easy",
  "category": "COND",
  "skin": "theory"
 },
 {
  "question": "An extension cord that feels hot under load means…",
  "choices": [
   "The cord is overloaded or undersized — stop and check",
   "Normal operation",
   "The tool is energy efficient"
  ],
  "answer": "The cord is overloaded or undersized — stop and check",
  "why": "A properly sized cord runs cool — heat is wasted power and a warning sign.",
  "difficulty": "easy",
  "category": "COND",
  "skin": "both"
 },
 {
  "question": "A longer wire of the same size has…",
  "choices": [
   "More resistance",
   "Less resistance",
   "The same resistance"
  ],
  "answer": "More resistance",
  "why": "Resistance grows with length — the root cause of voltage drop on long runs.",
  "difficulty": "easy",
  "category": "COND",
  "skin": "theory"
 },
 {
  "question": "Stranded conductors are chosen over solid where…",
  "choices": [
   "Flexibility is needed, like cords and equipment leads",
   "Maximum stiffness is needed",
   "The run is underground"
  ],
  "answer": "Flexibility is needed, like cords and equipment leads",
  "why": "Many small strands flex without breaking — that is why cords are stranded.",
  "difficulty": "easy",
  "category": "COND",
  "skin": "theory"
 },
 {
  "question": "The job of wire insulation is to…",
  "choices": [
   "Keep current in the conductor and prevent unintended contact",
   "Increase the current capacity",
   "Make the wire easier to pull"
  ],
  "answer": "Keep current in the conductor and prevent unintended contact",
  "why": "Insulation is the barrier between the circuit and everything else — protect it and it protects you.",
  "difficulty": "easy",
  "category": "COND",
  "skin": "theory"
 },
 {
  "question": "AWG stands for…",
  "choices": [
   "American Wire Gauge",
   "Average Wire Grade",
   "Amperage Wattage Guide"
  ],
  "answer": "American Wire Gauge",
  "why": "AWG is the US standard for conductor sizes — and it counts backwards.",
  "difficulty": "easy",
  "category": "COND",
  "skin": "theory"
 },
 {
  "question": "Loose terminal connections are dangerous because they…",
  "choices": [
   "Create resistance that generates heat at the connection",
   "Lower the voltage safely",
   "Make the circuit quieter"
  ],
  "answer": "Create resistance that generates heat at the connection",
  "why": "A loose lug is a tiny heater — many electrical fires start at a bad connection, not in the wire run.",
  "difficulty": "easy",
  "category": "COND",
  "skin": "theory"
 },
 {
  "question": "Bundling many current-carrying conductors in one conduit requires…",
  "choices": [
   "Derating their ampacity",
   "No change",
   "A larger breaker"
  ],
  "answer": "Derating their ampacity",
  "why": "Packed conductors cannot shed heat — each one must be credited with less capacity.",
  "difficulty": "medium",
  "category": "COND",
  "skin": "theory"
 },
 {
  "question": "In a high-ambient-temperature space like a hot attic, conductor ampacity…",
  "choices": [
   "Must be corrected downward",
   "Increases",
   "Is unaffected"
  ],
  "answer": "Must be corrected downward",
  "why": "Ampacity assumes a reference ambient — hotter surroundings mean the wire starts closer to its heat limit.",
  "difficulty": "medium",
  "category": "COND",
  "skin": "theory"
 },
 {
  "question": "To match copper's ampacity, an aluminum conductor must be…",
  "choices": [
   "A larger size",
   "The same size",
   "One size smaller"
  ],
  "answer": "A larger size",
  "why": "Aluminum has higher resistivity — the same job takes more metal.",
  "difficulty": "medium",
  "category": "COND",
  "skin": "theory"
 },
 {
  "question": "The commonly recommended maximum voltage drop for a branch circuit is about…",
  "choices": [
   "About 3%",
   "About 10%",
   "About 25%"
  ],
  "answer": "About 3%",
  "why": "Around 3% keeps equipment at healthy voltage — a recommendation for performance, not a hard trip point.",
  "difficulty": "medium",
  "category": "COND",
  "skin": "theory"
 },
 {
  "question": "Doubling the length of a circuit run at the same load roughly…",
  "choices": [
   "Doubles the voltage drop",
   "Halves the voltage drop",
   "Does not change the drop"
  ],
  "answer": "Doubles the voltage drop",
  "why": "Twice the wire is twice the resistance, and drop equals current times resistance.",
  "difficulty": "medium",
  "category": "COND",
  "skin": "theory"
 },
 {
  "question": "A conductor's ampacity is limited by…",
  "choices": [
   "Its insulation's temperature rating and how it is installed",
   "The color of the jacket",
   "The breaker manufacturer"
  ],
  "answer": "Its insulation's temperature rating and how it is installed",
  "why": "The copper survives heat the insulation cannot — insulation rating plus install conditions set the number.",
  "difficulty": "medium",
  "category": "COND",
  "skin": "theory"
 },
 {
  "question": "Power wasted as heat in a conductor equals…",
  "choices": [
   "Current squared times the wire's resistance",
   "Voltage times resistance",
   "Current divided by resistance"
  ],
  "answer": "Current squared times the wire's resistance",
  "why": "I-squared-R: doubling current quadruples wire heating — why high-amp circuits need serious copper.",
  "difficulty": "medium",
  "category": "COND",
  "skin": "theory"
 },
 {
  "question": "A feeder drops 3 V at 10 A. At 20 A the drop is about…",
  "choices": [
   "6 V",
   "3 V",
   "1.5 V"
  ],
  "answer": "6 V",
  "why": "Voltage drop is I times R — same wire, double the current, double the drop.",
  "difficulty": "hard",
  "category": "COND",
  "skin": "theory"
 },
 {
  "question": "A 120 V circuit with 5% voltage drop delivers about…",
  "choices": [
   "114 V",
   "110 V",
   "117 V"
  ],
  "answer": "114 V",
  "why": "5% of 120 V is 6 V lost in the wire — the load sees 114 V.",
  "difficulty": "hard",
  "category": "COND",
  "skin": "theory"
 },
 {
  "question": "After derating, a conductor's adjusted ampacity comes out below the load current. You must…",
  "choices": [
   "Use a larger conductor",
   "Ignore the derating",
   "Add a second breaker"
  ],
  "answer": "Use a larger conductor",
  "why": "Derating is real capacity loss — the fix is more copper, never wishful math.",
  "difficulty": "hard",
  "category": "COND",
  "skin": "theory"
 },
 {
  "question": "You upsize a long run's conductors to control voltage drop. The breaker…",
  "choices": [
   "Stays sized to the load — bigger wire never requires a bigger breaker",
   "Must be upsized to match the wire",
   "Must be downsized"
  ],
  "answer": "Stays sized to the load — bigger wire never requires a bigger breaker",
  "why": "The OCPD protects per the load and circuit design; oversizing the wire only adds margin.",
  "difficulty": "hard",
  "category": "COND",
  "skin": "theory"
 },
 {
  "question": "A 90-degree-C rated conductor lands on equipment terminals rated 75 degrees C. Ampacity is taken from…",
  "choices": [
   "The 75-degree column — the termination is the weak link",
   "The 90-degree column",
   "The average of the two"
  ],
  "answer": "The 75-degree column — the termination is the weak link",
  "why": "The connection point sets the limit — terminals overheat before the insulation does.",
  "difficulty": "hard",
  "category": "COND",
  "skin": "theory"
 },
 {
  "question": "The PASS method for fire extinguishers is…",
  "choices": [
   "Pull, Aim, Squeeze, Sweep",
   "Push And Stand Still",
   "Point At Smoke Source"
  ],
  "answer": "Pull, Aim, Squeeze, Sweep",
  "why": "Pull the pin, aim at the base, squeeze the handle, sweep side to side.",
  "difficulty": "easy",
  "category": "FIRE",
  "skin": "both"
 },
 {
  "question": "A fire watch during hot work must continue…",
  "choices": [
   "During and after the work is done",
   "Only while sparks are visible",
   "Only if a fire starts"
  ],
  "answer": "During and after the work is done",
  "why": "Smoldering starts late — keep the watch going after welding or cutting stops.",
  "difficulty": "medium",
  "category": "FIRE",
  "skin": "both"
 },
 {
  "question": "The right extinguisher class for an electrical fire is…",
  "choices": [
   "Class C",
   "Class A",
   "Class K"
  ],
  "answer": "Class C",
  "why": "Class C agents don't conduct — water on an energized fire electrocutes the operator.",
  "difficulty": "medium",
  "category": "FIRE",
  "skin": "both"
 },
 {
  "question": "Flammable liquids on site must be stored…",
  "choices": [
   "In approved safety cans and cabinets",
   "In any spare bucket",
   "Next to the welding area"
  ],
  "answer": "In approved safety cans and cabinets",
  "why": "Approved containers control vapors and flame — that's what keeps fuel from becoming fire.",
  "difficulty": "easy",
  "category": "FIRE",
  "skin": "both"
 },
 {
  "question": "A GFCI protects people by…",
  "choices": [
   "Tripping fast when current leaks to ground",
   "Limiting the voltage",
   "Adding a bigger fuse"
  ],
  "answer": "Tripping fast when current leaks to ground",
  "why": "It compares outgoing and returning current — a few milliamps of leakage trips it in a blink.",
  "difficulty": "easy",
  "category": "GRND",
  "skin": "both"
 },
 {
  "question": "GFCI protection is required…",
  "choices": [
   "In damp and wet locations",
   "Only in bedrooms",
   "Only above 240 V"
  ],
  "answer": "In damp and wet locations",
  "why": "Bathrooms, outdoors, garages — anywhere water and people meet the circuit.",
  "difficulty": "easy",
  "category": "GRND",
  "skin": "both"
 },
 {
  "question": "The ground prong on a plug…",
  "choices": [
   "Must never be removed",
   "Can be cut off if in the way",
   "Is only for looks"
  ],
  "answer": "Must never be removed",
  "why": "The ground path is what lets a fault trip the breaker instead of energizing the tool case.",
  "difficulty": "easy",
  "category": "GRND",
  "skin": "both"
 },
 {
  "question": "Which device protects people by detecting current leaking to ground?",
  "choices": [
   "GFCI",
   "AFCI",
   "SPD",
   "Fuse"
  ],
  "answer": "GFCI",
  "why": "A GFCI trips on small ground-leakage currents (about 4-6 mA) to protect people.",
  "difficulty": "easy",
  "category": "GRND",
  "skin": "theory"
 },
 {
  "question": "In the US, the equipment grounding conductor is identified by…",
  "choices": [
   "Green insulation or bare copper",
   "White insulation",
   "Red insulation"
  ],
  "answer": "Green insulation or bare copper",
  "why": "Green or bare = grounding; white or gray = grounded (neutral).",
  "difficulty": "easy",
  "category": "GRND",
  "skin": "theory"
 },
 {
  "question": "The grounded (neutral) conductor is normally colored…",
  "choices": [
   "White or gray",
   "Green",
   "Black"
  ],
  "answer": "White or gray",
  "why": "White or gray identifies the grounded conductor; never reuse it as a hot without re-identification.",
  "difficulty": "easy",
  "category": "GRND",
  "skin": "theory"
 },
 {
  "question": "Which location requires GFCI-protected receptacles?",
  "choices": [
   "Bathrooms",
   "Bedroom closets",
   "Hallway ceilings"
  ],
  "answer": "Bathrooms",
  "why": "Water plus receptacles = GFCI territory: bathrooms, kitchens, garages, outdoors.",
  "difficulty": "easy",
  "category": "GRND",
  "skin": "theory"
 },
 {
  "question": "A hair dryer falls into a sink of water — which device prevents electrocution?",
  "choices": [
   "GFCI",
   "AFCI",
   "SPD"
  ],
  "answer": "GFCI",
  "why": "Ground-fault protection at wet locations is exactly this scenario.",
  "difficulty": "easy",
  "category": "GRND",
  "skin": "both"
 },
 {
  "question": "A GFCI does NOT protect against…",
  "choices": [
   "Overloading the circuit",
   "Ground faults through a person",
   "Leakage current to earth"
  ],
  "answer": "Overloading the circuit",
  "why": "GFCI watches leakage, not total load — overload protection is the breaker's job.",
  "difficulty": "medium",
  "category": "GRND",
  "skin": "theory"
 },
 {
  "question": "Bonding metal parts together…",
  "choices": [
   "Puts them at the same potential",
   "Makes them magnetic",
   "Doubles the voltage"
  ],
  "answer": "Puts them at the same potential",
  "why": "Equal potential means no shock current between parts — and a clear path for faults.",
  "difficulty": "medium",
  "category": "GRND",
  "skin": "theory"
 },
 {
  "question": "Equipment grounding conductors carry current…",
  "choices": [
   "Only during a fault",
   "All the time",
   "Never"
  ],
  "answer": "Only during a fault",
  "why": "The EGC is the emergency path — its job is to trip the breaker fast during a fault.",
  "difficulty": "medium",
  "category": "GRND",
  "skin": "theory"
 },
 {
  "question": "A GFCI trips when ground-leakage current reaches approximately…",
  "choices": [
   "4-6 mA",
   "15 A",
   "100 mA",
   "1 A"
  ],
  "answer": "4-6 mA",
  "why": "People-protection GFCIs trip at 4-6 mA — far below the level that stops a heart.",
  "difficulty": "medium",
  "category": "GRND",
  "skin": "theory"
 },
 {
  "question": "A metal tool case becomes energized. What saves the user?",
  "choices": [
   "A low-impedance ground path tripping the breaker",
   "The rubber feet",
   "Luck"
  ],
  "answer": "A low-impedance ground path tripping the breaker",
  "why": "The fault current needs a highway back — that is what clears the fault fast.",
  "difficulty": "hard",
  "category": "GRND",
  "skin": "theory"
 },
 {
  "question": "Grounding and bonding matter because they…",
  "choices": [
   "Give fault current a low-impedance path so devices can clear the fault",
   "Make wires cheaper",
   "Reduce the power bill"
  ],
  "answer": "Give fault current a low-impedance path so devices can clear the fault",
  "why": "Without an effective ground path, protective devices may never see the fault.",
  "difficulty": "hard",
  "category": "GRND",
  "skin": "both"
 },
 {
  "question": "The difference between grounding and bonding is…",
  "choices": [
   "Grounding ties the system to earth; bonding ties metal parts to each other",
   "They are two words for the same connection",
   "Bonding is only for lightning"
  ],
  "answer": "Grounding ties the system to earth; bonding ties metal parts to each other",
  "why": "Two jobs: an earth reference for the system, metal-to-metal continuity for fault clearing.",
  "difficulty": "medium",
  "category": "GRND",
  "skin": "theory"
 },
 {
  "question": "A GFCI decides to trip by…",
  "choices": [
   "Comparing current going out on the hot with current returning on the neutral",
   "Measuring the total load in amps",
   "Sensing heat in the receptacle"
  ],
  "answer": "Comparing current going out on the hot with current returning on the neutral",
  "why": "Out must equal back — a few milliamps of imbalance means current is escaping through something, maybe you.",
  "difficulty": "medium",
  "category": "GRND",
  "skin": "theory"
 },
 {
  "question": "On a GFCI receptacle, devices wired to the LOAD terminals…",
  "choices": [
   "Also get GFCI protection downstream",
   "Bypass the protection",
   "Trip the breaker instantly"
  ],
  "answer": "Also get GFCI protection downstream",
  "why": "One GFCI at the head of the line can protect the whole downstream run.",
  "difficulty": "medium",
  "category": "GRND",
  "skin": "theory"
 },
 {
  "question": "If a tool's equipment grounding conductor is broken, the tool…",
  "choices": [
   "Runs normally but has lost its fault protection",
   "Stops working immediately",
   "Becomes double insulated"
  ],
  "answer": "Runs normally but has lost its fault protection",
  "why": "The EGC carries no current in normal use — a broken one hides until the fault that needed it.",
  "difficulty": "medium",
  "category": "GRND",
  "skin": "theory"
 },
 {
  "question": "Wet skin is dangerous around electricity because it…",
  "choices": [
   "Drops your body's resistance, so the same voltage pushes more current through you",
   "Increases your body's resistance",
   "Insulates you from ground"
  ],
  "answer": "Drops your body's resistance, so the same voltage pushes more current through you",
  "why": "Ohm's law applies to people — less resistance, more current, and milliamps are what stop hearts.",
  "difficulty": "medium",
  "category": "GRND",
  "skin": "theory"
 },
 {
  "question": "The grounding electrode (ground rod) system mainly exists to…",
  "choices": [
   "Limit voltage from lightning and utility surges and stabilize the system to earth",
   "Trip breakers during ground faults",
   "Power the neutral"
  ],
  "answer": "Limit voltage from lightning and utility surges and stabilize the system to earth",
  "why": "The rod handles sky-and-surge duty — fault clearing is the EGC and bonding's job, not the dirt's.",
  "difficulty": "medium",
  "category": "GRND",
  "skin": "theory"
 },
 {
  "question": "Shock severity depends mostly on…",
  "choices": [
   "How much current flows, its path through the body, and for how long",
   "The brand of the tool",
   "The gauge of the wire"
  ],
  "answer": "How much current flows, its path through the body, and for how long",
  "why": "Current through the chest for longer is the killer combination — voltage only matters as what drives the current.",
  "difficulty": "medium",
  "category": "GRND",
  "skin": "theory"
 },
 {
  "question": "A standard breaker cannot protect a person from shock because…",
  "choices": [
   "It trips at amps, while dangerous shock current is only milliamps",
   "It reacts too quickly",
   "It only works on 240 V"
  ],
  "answer": "It trips at amps, while dangerous shock current is only milliamps",
  "why": "A 20 A breaker sleeps through a 100 mA shock — that gap is exactly why GFCIs exist.",
  "difficulty": "medium",
  "category": "GRND",
  "skin": "theory"
 },
 {
  "question": "Using a three-prong-to-two-prong adapter without landing its tab defeats…",
  "choices": [
   "The equipment grounding path",
   "The neutral",
   "The insulation"
  ],
  "answer": "The equipment grounding path",
  "why": "The cheater plug floats the tool's case — the fault path back to the panel is gone.",
  "difficulty": "medium",
  "category": "GRND",
  "skin": "theory"
 },
 {
  "question": "Double-insulated tools are permitted without an equipment ground because…",
  "choices": [
   "Two independent insulation layers stand between live parts and the user",
   "They run on low voltage only",
   "Their cases are magnetic"
  ],
  "answer": "Two independent insulation layers stand between live parts and the user",
  "why": "The square-in-a-square marking means protection by insulation instead of by grounding.",
  "difficulty": "medium",
  "category": "GRND",
  "skin": "theory"
 },
 {
  "question": "The neutral-to-ground bond belongs…",
  "choices": [
   "Only at the service disconnect, not in downstream subpanels",
   "In every panel for redundancy",
   "At each receptacle"
  ],
  "answer": "Only at the service disconnect, not in downstream subpanels",
  "why": "Extra bonds put normal neutral current onto metal parts and grounding conductors — one bond, at the service.",
  "difficulty": "hard",
  "category": "GRND",
  "skin": "theory"
 },
 {
  "question": "A GFCI installed on an old two-wire circuit with no ground wire…",
  "choices": [
   "Still protects people — it senses imbalance and needs no EGC",
   "Cannot function",
   "Only works on 240 V"
  ],
  "answer": "Still protects people — it senses imbalance and needs no EGC",
  "why": "GFCI protection is math, not grounding — which is why code allows GFCIs to replace ungrounded receptacles.",
  "difficulty": "hard",
  "category": "GRND",
  "skin": "theory"
 },
 {
  "question": "Driving a ground rod at a shed instead of running an equipment grounding conductor…",
  "choices": [
   "Does not clear faults — earth's resistance is far too high to trip a breaker",
   "Works as well as an EGC",
   "Doubles the protection"
  ],
  "answer": "Does not clear faults — earth's resistance is far too high to trip a breaker",
  "why": "Dirt is a terrible conductor: a 120 V fault through a rod may draw only a few amps — the breaker never notices.",
  "difficulty": "hard",
  "category": "GRND",
  "skin": "theory"
 },
 {
  "question": "During a ground fault, the fault current's return path to the transformer is…",
  "choices": [
   "The EGC and the main bonding jumper — not the earth",
   "Through the soil to the utility pole",
   "The hot conductor of another circuit"
  ],
  "answer": "The EGC and the main bonding jumper — not the earth",
  "why": "Fault current wants its source — the metallic bonding path is what carries it back and trips the device.",
  "difficulty": "hard",
  "category": "GRND",
  "skin": "theory"
 },
 {
  "question": "A bootleg ground (neutral jumped to the ground screw) is dangerous because…",
  "choices": [
   "Normal neutral current flows on the ground path, and a broken neutral energizes tool cases",
   "It trips the GFCI too often",
   "It doubles the voltage"
  ],
  "answer": "Normal neutral current flows on the ground path, and a broken neutral energizes tool cases",
  "why": "The case rides on the neutral — one loose neutral connection upstream and every grounded surface goes live.",
  "difficulty": "hard",
  "category": "GRND",
  "skin": "theory"
 },
 {
  "question": "A GFCI will NOT save someone who contacts…",
  "choices": [
   "Hot and neutral at the same time",
   "Hot and the equipment ground",
   "Hot and a water pipe"
  ],
  "answer": "Hot and neutral at the same time",
  "why": "Body current from hot to neutral looks exactly like a load — balanced, invisible to the sensor.",
  "difficulty": "hard",
  "category": "GRND",
  "skin": "theory"
 },
 {
  "question": "The equipment grounding conductor must be run with the circuit conductors because…",
  "choices": [
   "Separation raises the path's impedance and slows fault clearing",
   "It looks neater",
   "Color codes require it"
  ],
  "answer": "Separation raises the path's impedance and slows fault clearing",
  "why": "Keeping the fault path physically close to its circuit keeps impedance low — fast tripping depends on it.",
  "difficulty": "hard",
  "category": "GRND",
  "skin": "theory"
 },
 {
  "question": "An intact neutral sits near 0 V, but opening a loaded neutral is dangerous because…",
  "choices": [
   "The full circuit voltage appears across the break",
   "It stays at exactly 0 V",
   "The current stops instantly"
  ],
  "answer": "The full circuit voltage appears across the break",
  "why": "The load re-references the broken end at line voltage — treat every neutral as live until proven dead.",
  "difficulty": "hard",
  "category": "GRND",
  "skin": "theory"
 },
 {
  "question": "A downed power line should be treated as…",
  "choices": [
   "Energized until the utility confirms otherwise",
   "Dead if it isn't sparking",
   "Safe after 10 minutes"
  ],
  "answer": "Energized until the utility confirms otherwise",
  "why": "A line can be silent, still, and lethal — stay back and call the utility.",
  "difficulty": "easy",
  "category": "ELEC",
  "skin": "both"
 },
 {
  "question": "Temporary power on a construction site should run through…",
  "choices": [
   "GFCI protection",
   "A bigger breaker",
   "An extension cord splitter"
  ],
  "answer": "GFCI protection",
  "why": "GFCIs cut power fast when current leaks to ground — that protects people.",
  "difficulty": "easy",
  "category": "ELEC",
  "skin": "both"
 },
 {
  "question": "A damaged extension cord on site should be…",
  "choices": [
   "Taken out of service immediately",
   "Wrapped in tape",
   "Used for light loads only"
  ],
  "answer": "Taken out of service immediately",
  "why": "A damaged cord is a shock and fire hazard — remove it, don't patch it.",
  "difficulty": "medium",
  "category": "ELEC",
  "skin": "both"
 },
 {
  "question": "Verifying zero energy after locking out means…",
  "choices": [
   "Testing the circuit with a meter before touching it",
   "Trusting the lock",
   "Asking a coworker"
  ],
  "answer": "Testing the circuit with a meter before touching it",
  "why": "Test before touch — the lock proves intent, the meter proves it's dead.",
  "difficulty": "hard",
  "category": "ELEC",
  "skin": "both"
 },
 {
  "question": "A kilowatt (kW) measures power; a kilowatt-hour (kWh) measures…",
  "choices": [
   "Energy — power used over time",
   "Voltage",
   "Peak current"
  ],
  "answer": "Energy — power used over time",
  "why": "kW is the rate, kWh is the total — a 1 kW heater running 3 hours uses 3 kWh.",
  "difficulty": "easy",
  "category": "DIST",
  "skin": "theory"
 },
 {
  "question": "Demand factors exist because…",
  "choices": [
   "Not all connected loads run at the same time",
   "Wire is cheap",
   "Meters read high"
  ],
  "answer": "Not all connected loads run at the same time",
  "why": "Sizing for everything at once would be waste — real systems ride on diversity.",
  "difficulty": "easy",
  "category": "DIST",
  "skin": "theory"
 },
 {
  "question": "Standard US residential service is…",
  "choices": [
   "120/240 V split-phase",
   "480 V three-phase",
   "12 V DC"
  ],
  "answer": "120/240 V split-phase",
  "why": "Two hot legs and a neutral from a center-tapped transformer — 120 V to neutral, 240 V leg to leg.",
  "difficulty": "easy",
  "category": "DIST",
  "skin": "theory"
 },
 {
  "question": "A feeder is the wiring that runs…",
  "choices": [
   "From the service equipment to a downstream panel's branch breakers",
   "From a receptacle to the lamp",
   "From the meter to the utility pole"
  ],
  "answer": "From the service equipment to a downstream panel's branch breakers",
  "why": "Service, then feeders, then branch circuits — feeders are the middle links of the distribution chain.",
  "difficulty": "easy",
  "category": "DIST",
  "skin": "theory"
 },
 {
  "question": "Connected load means…",
  "choices": [
   "The total of every load as if all ran at once",
   "The load actually measured at noon",
   "Only the largest single appliance"
  ],
  "answer": "The total of every load as if all ran at once",
  "why": "Connected is the raw sum — demand is what you get after applying diversity.",
  "difficulty": "easy",
  "category": "DIST",
  "skin": "theory"
 },
 {
  "question": "Electric resistance heaters convert electrical energy to heat at…",
  "choices": [
   "Essentially 100% at the point of use",
   "About 50%",
   "About 10%"
  ],
  "answer": "Essentially 100% at the point of use",
  "why": "Every watt in becomes heat — the catch is that a heat pump can move more heat than that per watt.",
  "difficulty": "easy",
  "category": "DIST",
  "skin": "theory"
 },
 {
  "question": "A dwelling has 12 kW of connected load with a 50% demand factor. Demand load is…",
  "choices": [
   "6 kW",
   "24 kW",
   "12 kW"
  ],
  "answer": "6 kW",
  "why": "Demand = connected times the factor: 12 x 0.5 = 6 kW — the number the service actually needs to carry.",
  "difficulty": "medium",
  "category": "DIST",
  "skin": "theory"
 },
 {
  "question": "A straight 240 V load like a water heater puts how much current on the neutral?",
  "choices": [
   "None — a pure 240 V load uses only the two hot legs",
   "All of it",
   "Half of it"
  ],
  "answer": "None — a pure 240 V load uses only the two hot legs",
  "why": "Line-to-line loads loop leg to leg — the neutral only ever carries the 120 V imbalance.",
  "difficulty": "medium",
  "category": "DIST",
  "skin": "theory"
 },
 {
  "question": "In a 120/240 V panel, the neutral carries…",
  "choices": [
   "Only the difference between the two legs' 120 V loads",
   "The sum of both legs",
   "Exactly half the total"
  ],
  "answer": "Only the difference between the two legs' 120 V loads",
  "why": "Balanced legs cancel on the neutral — that is the point of splitting the phases.",
  "difficulty": "medium",
  "category": "DIST",
  "skin": "theory"
 },
 {
  "question": "When filling out a panel schedule, 120 V loads should be…",
  "choices": [
   "Balanced as evenly as possible across both legs",
   "Stacked on leg A first",
   "Placed only near the main"
  ],
  "answer": "Balanced as evenly as possible across both legs",
  "why": "Balancing evens the heating, steadies voltages, and keeps neutral current low.",
  "difficulty": "medium",
  "category": "DIST",
  "skin": "theory"
 },
 {
  "question": "A 2-pole breaker serves a 240 V load by…",
  "choices": [
   "Connecting across both hot legs",
   "Doubling the current on one leg",
   "Using the neutral as a hot"
  ],
  "answer": "Connecting across both hot legs",
  "why": "240 V lives between the legs — a 2-pole breaker grabs one of each and trips them together.",
  "difficulty": "medium",
  "category": "DIST",
  "skin": "theory"
 },
 {
  "question": "A 4800 W water heater at 240 V draws…",
  "choices": [
   "20 A",
   "48 A",
   "10 A"
  ],
  "answer": "20 A",
  "why": "I = P / V = 4800 / 240 = 20 A — load-calc arithmetic you will do constantly.",
  "difficulty": "medium",
  "category": "DIST",
  "skin": "theory"
 },
 {
  "question": "The breaker handles in a panel add up to far more than the main rating. This is…",
  "choices": [
   "Normal — diversity means they never all run at once",
   "A code violation",
   "A sign the main is failing"
  ],
  "answer": "Normal — diversity means they never all run at once",
  "why": "Panels are sized to calculated demand, not to the sum of the handles.",
  "difficulty": "medium",
  "category": "DIST",
  "skin": "theory"
 },
 {
  "question": "A continuous load is one expected to run at maximum for…",
  "choices": [
   "3 hours or more",
   "15 minutes",
   "24 hours only"
  ],
  "answer": "3 hours or more",
  "why": "Three hours is the line — past it, conductors and breakers are sized at 125%.",
  "difficulty": "medium",
  "category": "DIST",
  "skin": "theory"
 },
 {
  "question": "Fixed electric space heating is sized at 125% because it is treated as…",
  "choices": [
   "A continuous load",
   "A motor load",
   "A surge load"
  ],
  "answer": "A continuous load",
  "why": "Heat runs for hours on a cold night — the 25% margin keeps the circuit from cooking at full output.",
  "difficulty": "medium",
  "category": "DIST",
  "skin": "theory"
 },
 {
  "question": "A home has 10 kW of electric heat and 5 kW of air conditioning. The load calculation counts…",
  "choices": [
   "Only the 10 kW heat — the larger of loads that never run together",
   "All 15 kW",
   "Only the AC"
  ],
  "answer": "Only the 10 kW heat — the larger of loads that never run together",
  "why": "Heating and cooling are noncoincident — you will never need both at once, so only the bigger one counts.",
  "difficulty": "medium",
  "category": "DIST",
  "skin": "theory"
 },
 {
  "question": "Utilities serving lots of electric heat see their annual peak demand in…",
  "choices": [
   "Winter cold snaps",
   "Mild spring weeks",
   "Summer nights only"
  ],
  "answer": "Winter cold snaps",
  "why": "Resistance heat stacked across a whole region peaks the grid on the coldest mornings.",
  "difficulty": "medium",
  "category": "DIST",
  "skin": "theory"
 },
 {
  "question": "Beyond energy (kWh), commercial customers are often billed for…",
  "choices": [
   "Their peak demand in kW",
   "The number of breakers",
   "Wire length"
  ],
  "answer": "Their peak demand in kW",
  "why": "The grid must be built for your worst 15 minutes — demand charges recover that capacity cost.",
  "difficulty": "medium",
  "category": "DIST",
  "skin": "theory"
 },
 {
  "question": "A dwelling's general lighting load is calculated from…",
  "choices": [
   "The floor area in square feet",
   "The number of windows",
   "The roof height"
  ],
  "answer": "The floor area in square feet",
  "why": "Volt-amperes per square foot of livable space — floor area stands in for the lighting and receptacle load.",
  "difficulty": "medium",
  "category": "DIST",
  "skin": "theory"
 },
 {
  "question": "Compared with resistance heat, a heat pump delivers…",
  "choices": [
   "More heat per kWh, because it moves heat instead of making it",
   "Less heat per kWh",
   "Identical heat per kWh"
  ],
  "answer": "More heat per kWh, because it moves heat instead of making it",
  "why": "A COP of 3 means three units of heat per unit of electricity — until deep cold erodes it.",
  "difficulty": "medium",
  "category": "DIST",
  "skin": "theory"
 },
 {
  "question": "A branch circuit is the wiring…",
  "choices": [
   "From the final overcurrent device to the outlets it serves",
   "From the transformer to the meter",
   "Between two panels"
  ],
  "answer": "From the final overcurrent device to the outlets it serves",
  "why": "The last hop of the system — everything past the last breaker is branch circuit.",
  "difficulty": "medium",
  "category": "DIST",
  "skin": "theory"
 },
 {
  "question": "A dwelling's calculated load is 22,800 VA at 240 V. The minimum service is…",
  "choices": [
   "100 A — 95 A calculated, rounded up to the next standard size",
   "95 A exactly",
   "125 A"
  ],
  "answer": "100 A — 95 A calculated, rounded up to the next standard size",
  "why": "22,800 / 240 = 95 A; services come in standard ratings, so 100 A is the floor.",
  "difficulty": "hard",
  "category": "DIST",
  "skin": "theory"
 },
 {
  "question": "A multiwire branch circuit's two hots must land on opposite legs because…",
  "choices": [
   "On the same leg the shared neutral carries the sum of both currents and can overheat",
   "It looks better in the panel",
   "Opposite legs double the voltage to each load"
  ],
  "answer": "On the same leg the shared neutral carries the sum of both currents and can overheat",
  "why": "On opposite legs the neutral carries only the difference; on the same leg it quietly carries double.",
  "difficulty": "hard",
  "category": "DIST",
  "skin": "theory"
 },
 {
  "question": "A feeder's neutral can sometimes be smaller than its hot conductors because…",
  "choices": [
   "It carries only the unbalanced portion of the load",
   "Neutrals never carry current",
   "Code ignores neutrals"
  ],
  "answer": "It carries only the unbalanced portion of the load",
  "why": "Heavy 240 V loading means light neutral duty — the calculation permits a reduced neutral.",
  "difficulty": "hard",
  "category": "DIST",
  "skin": "theory"
 },
 {
  "question": "A 9.6 kW (40 A at 240 V) electric furnace treated as continuous requires a circuit sized at least…",
  "choices": [
   "50 A — 40 A times 125%",
   "40 A exactly",
   "35 A"
  ],
  "answer": "50 A — 40 A times 125%",
  "why": "Continuous loads get the 125% treatment: 40 x 1.25 = 50 A of circuit capacity.",
  "difficulty": "hard",
  "category": "DIST",
  "skin": "theory"
 },
 {
  "question": "Heat pump systems can drive extreme winter peaks because…",
  "choices": [
   "In deep cold their efficiency drops and resistance backup strips switch on",
   "Their compressors shut off in winter",
   "They consume power only in summer"
  ],
  "answer": "In deep cold their efficiency drops and resistance backup strips switch on",
  "why": "The coldest hour converts a neighborhood of efficient heat pumps into raw resistance heat — right at system peak.",
  "difficulty": "hard",
  "category": "DIST",
  "skin": "theory"
 },
 {
  "question": "A utility transformer serving ten homes is sized far below ten full services because…",
  "choices": [
   "Homes hit their individual peaks at different times — load diversity",
   "Transformers overload safely",
   "Each home only gets a tenth of its service"
  ],
  "answer": "Homes hit their individual peaks at different times — load diversity",
  "why": "Diversity is the grid's quiet superpower — the coincident peak is much smaller than the sum of possible peaks.",
  "difficulty": "hard",
  "category": "DIST",
  "skin": "theory"
 },
 {
  "question": "Demand factors are allowed on household cooking equipment because…",
  "choices": [
   "All burners and ovens practically never run at maximum simultaneously",
   "Ranges use no real power",
   "Cooking is a continuous load"
  ],
  "answer": "All burners and ovens practically never run at maximum simultaneously",
  "why": "A 12 kW range almost never draws 12 kW — usage diversity is baked into the calculation.",
  "difficulty": "hard",
  "category": "DIST",
  "skin": "theory"
 },
 {
  "question": "Why are load calculations done in volt-amperes (VA) rather than watts?",
  "choices": [
   "VA tracks the current the conductors must carry regardless of power factor",
   "Watts cannot be measured",
   "VA is always the smaller number"
  ],
  "answer": "VA tracks the current the conductors must carry regardless of power factor",
  "why": "Sizing rides on current: VA divided by voltage gives amps directly, power factor or not.",
  "difficulty": "hard",
  "category": "DIST",
  "skin": "theory"
 },
 {
  "question": "A load of 10 kW at 0.8 power factor requires apparent power of…",
  "choices": [
   "12.5 kVA",
   "8 kVA",
   "10 kVA"
  ],
  "answer": "12.5 kVA",
  "why": "kVA = kW / PF = 10 / 0.8 — the wires must carry the full 12.5 kVA of current.",
  "difficulty": "hard",
  "category": "DIST",
  "skin": "theory"
 },
 {
  "question": "Before adding a 48 A EV charger to an existing 100 A service, you must…",
  "choices": [
   "Run a load calculation to verify the service has capacity",
   "Just install it — services have slack",
   "Swap the meter"
  ],
  "answer": "Run a load calculation to verify the service has capacity",
  "why": "A near-half-service continuous load can push an older service past its rating — calculate first, install second.",
  "difficulty": "hard",
  "category": "DIST",
  "skin": "theory"
 },
 {
  "question": "The two legs of a residential service measure 240 V between them because…",
  "choices": [
   "They come from opposite ends of a center-tapped transformer winding",
   "They are two separate utilities",
   "The neutral adds 120 V"
  ],
  "answer": "They come from opposite ends of a center-tapped transformer winding",
  "why": "One 240 V winding, tapped in the middle: each end is 120 V from center, 240 V end to end.",
  "difficulty": "hard",
  "category": "DIST",
  "skin": "theory"
 },
 {
  "question": "A failing (open) service neutral shows up as…",
  "choices": [
   "Some 120 V circuits running bright/high while others sag low",
   "All power out instantly",
   "Only 240 V loads failing"
  ],
  "answer": "Some 120 V circuits running bright/high while others sag low",
  "why": "With no neutral reference the two legs divide 240 V by load impedance — lights flare, electronics die.",
  "difficulty": "hard",
  "category": "DIST",
  "skin": "theory"
 },
 {
  "question": "As more dwelling units are added to a feeder calculation, the applied demand factor generally…",
  "choices": [
   "Decreases — diversity grows with the number of units",
   "Increases toward 100%",
   "Stays fixed at 100%"
  ],
  "answer": "Decreases — diversity grows with the number of units",
  "why": "Two hundred apartments never peak together — the more units, the deeper the allowed reduction.",
  "difficulty": "hard",
  "category": "DIST",
  "skin": "theory"
 },
 {
  "question": "In a standard split-phase panelboard, vertically adjacent breaker positions alternate legs so that…",
  "choices": [
   "A 2-pole breaker automatically lands across both legs for 240 V",
   "Every breaker sees the same leg",
   "The neutral bar stays cooler"
  ],
  "answer": "A 2-pole breaker automatically lands across both legs for 240 V",
  "why": "The bus fingers interleave A-B-A-B down the panel, so two adjacent positions always span both legs.",
  "difficulty": "hard",
  "category": "DIST",
  "skin": "theory"
 },
 {
  "question": "A subpanel's feeder is sized from…",
  "choices": [
   "The calculated demand of the loads it serves",
   "The sum of every breaker installed in it",
   "The size of the main panel"
  ],
  "answer": "The calculated demand of the loads it serves",
  "why": "Same rule as the service: calculated load, with demand factors — never the sum of the handles.",
  "difficulty": "hard",
  "category": "DIST",
  "skin": "theory"
 },
 {
  "question": "How should you climb a ladder?",
  "choices": [
   "Maintain 3 points of contact",
   "Carry tools in both hands",
   "Face away from the ladder"
  ],
  "answer": "Maintain 3 points of contact",
  "why": "Two hands + one foot (or two feet + one hand) on the ladder at all times.",
  "difficulty": "easy",
  "category": "FALL",
  "skin": "both"
 },
 {
  "question": "At what height does OSHA require fall protection in construction?",
  "choices": [
   "6 feet",
   "10 feet",
   "15 feet"
  ],
  "answer": "6 feet",
  "why": "Work at 6 ft or more above a lower level requires fall protection.",
  "difficulty": "easy",
  "category": "FALL",
  "skin": "both"
 },
 {
  "question": "The proper angle for an extension ladder is…",
  "choices": [
   "1 ft out for every 4 ft up",
   "1 ft out for every 8 ft up",
   "Flat against the wall"
  ],
  "answer": "1 ft out for every 4 ft up",
  "why": "The 4-to-1 rule keeps the ladder from kicking out or tipping back.",
  "difficulty": "medium",
  "category": "FALL",
  "skin": "both"
 },
 {
  "question": "A ladder's side rails must extend above the landing by at least…",
  "choices": [
   "3 feet",
   "6 inches",
   "They can stop at the edge"
  ],
  "answer": "3 feet",
  "why": "The 3-ft extension gives you a handhold while stepping on and off.",
  "difficulty": "medium",
  "category": "FALL",
  "skin": "both"
 },
 {
  "question": "A 20 A breaker with 25 A of connected load will…",
  "choices": [
   "Trip on overload",
   "Run forever",
   "Boost the voltage"
  ],
  "answer": "Trip on overload",
  "why": "The breaker protects the conductors — sustained current above rating opens it.",
  "difficulty": "easy",
  "category": "OCP",
  "skin": "both"
 },
 {
  "question": "The service disconnect's main job is to…",
  "choices": [
   "Cut all power to the building in one motion",
   "Save energy",
   "Boost the voltage"
  ],
  "answer": "Cut all power to the building in one motion",
  "why": "One clear means of disconnect — everything downstream goes dead together.",
  "difficulty": "easy",
  "category": "OCP",
  "skin": "theory"
 },
 {
  "question": "If a breaker feels hot to the touch, you should…",
  "choices": [
   "Investigate the load and connections",
   "Ignore it",
   "Spray it with water"
  ],
  "answer": "Investigate the load and connections",
  "why": "Heat means high current or a bad connection — both need attention now.",
  "difficulty": "easy",
  "category": "OCP",
  "skin": "both"
 },
 {
  "question": "Which device is single-use and must be replaced after it operates?",
  "choices": [
   "Fuse",
   "Circuit breaker",
   "GFCI"
  ],
  "answer": "Fuse",
  "why": "A fuse blows once; a breaker resets.",
  "difficulty": "easy",
  "category": "OCP",
  "skin": "theory"
 },
 {
  "question": "Lightning strikes nearby and a voltage spike hits the building. Which device absorbs it?",
  "choices": [
   "SPD",
   "GFCI",
   "Fuse"
  ],
  "answer": "SPD",
  "why": "Surge protective devices clamp transient overvoltage from lightning and switching.",
  "difficulty": "easy",
  "category": "OCP",
  "skin": "both"
 },
 {
  "question": "Which device detects dangerous arcing in a circuit?",
  "choices": [
   "AFCI",
   "GFCI",
   "SPD",
   "Fuse"
  ],
  "answer": "AFCI",
  "why": "An AFCI recognizes the electrical signature of arcing and opens the circuit.",
  "difficulty": "easy",
  "category": "OCP",
  "skin": "theory"
 },
 {
  "question": "A circuit breaker primarily protects…",
  "choices": [
   "The conductors from overheating",
   "The appliance warranty",
   "People from shock"
  ],
  "answer": "The conductors from overheating",
  "why": "Overcurrent protection is sized to the wire — GFCIs are what protect people.",
  "difficulty": "medium",
  "category": "OCP",
  "skin": "theory"
 },
 {
  "question": "An overload differs from a short circuit because it is…",
  "choices": [
   "Sustained current above rating, not a fault",
   "Always caused by lightning",
   "Harmless to conductors"
  ],
  "answer": "Sustained current above rating, not a fault",
  "why": "Overloads cook conductors slowly; shorts are faults with huge instant current.",
  "difficulty": "medium",
  "category": "OCP",
  "skin": "theory"
 },
 {
  "question": "A breaker that trips repeatedly means…",
  "choices": [
   "Find and fix the cause before resetting again",
   "Hold it closed",
   "Replace it with a bigger one"
  ],
  "answer": "Find and fix the cause before resetting again",
  "why": "A tripping breaker is doing its job — a bigger breaker just moves the failure into the wire.",
  "difficulty": "medium",
  "category": "OCP",
  "skin": "both"
 },
 {
  "question": "An AFCI breaker is designed to detect…",
  "choices": [
   "Dangerous arcing in the circuit",
   "Low voltage",
   "Power theft"
  ],
  "answer": "Dangerous arcing in the circuit",
  "why": "Arc faults from damaged cords and loose connections start fires — AFCIs open on the arc signature.",
  "difficulty": "medium",
  "category": "OCP",
  "skin": "theory"
 },
 {
  "question": "Never tie two separate circuits together because…",
  "choices": [
   "Backfeed can energize what should be dead",
   "It doubles the voltage",
   "Breakers work better in pairs"
  ],
  "answer": "Backfeed can energize what should be dead",
  "why": "Interconnected sources can feed a 'dead' circuit — lethal for anyone working on it.",
  "difficulty": "medium",
  "category": "OCP",
  "skin": "both"
 },
 {
  "question": "An overload is…",
  "choices": [
   "Sustained current above the circuit rating",
   "A bolted fault between conductors",
   "Current leaking to ground"
  ],
  "answer": "Sustained current above the circuit rating",
  "why": "Overload = too much current for too long; a short is a sudden low-impedance fault.",
  "difficulty": "medium",
  "category": "OCP",
  "skin": "theory"
 },
 {
  "question": "A surge protective device (SPD) protects against…",
  "choices": [
   "Transient overvoltages",
   "Sustained overloads",
   "Ground faults"
  ],
  "answer": "Transient overvoltages",
  "why": "SPDs clamp brief voltage spikes; overcurrent devices can't react to them.",
  "difficulty": "medium",
  "category": "OCP",
  "skin": "theory"
 },
 {
  "question": "For best performance, an SPD should be installed…",
  "choices": [
   "Close to the equipment it protects, with short leads",
   "At the far end of the branch circuit",
   "Anywhere — location doesn't matter"
  ],
  "answer": "Close to the equipment it protects, with short leads",
  "why": "Every inch of lead length adds impedance and raises the let-through voltage.",
  "difficulty": "medium",
  "category": "OCP",
  "skin": "theory"
 },
 {
  "question": "AFCI protection is primarily required in…",
  "choices": [
   "Dwelling bedrooms and living areas",
   "Outdoor receptacles",
   "Industrial switchgear"
  ],
  "answer": "Dwelling bedrooms and living areas",
  "why": "Arc faults in bedroom and living-area wiring are a leading cause of home electrical fires.",
  "difficulty": "medium",
  "category": "OCP",
  "skin": "theory"
 },
 {
  "question": "A damaged extension cord is arcing. The right protection is…",
  "choices": [
   "AFCI — and remove the cord from service",
   "SPD",
   "A bigger fuse"
  ],
  "answer": "AFCI — and remove the cord from service",
  "why": "AFCIs detect arcing; the damaged cord itself must also be tagged out of service.",
  "difficulty": "medium",
  "category": "OCP",
  "skin": "both"
 },
 {
  "question": "A breaker's inverse-time characteristic means…",
  "choices": [
   "Higher overcurrent trips it faster",
   "It trips at fixed time regardless of current",
   "It only trips at night"
  ],
  "answer": "Higher overcurrent trips it faster",
  "why": "Small overloads trip in minutes; heavy faults trip in a fraction of a second.",
  "difficulty": "medium",
  "category": "OCP",
  "skin": "theory"
 },
 {
  "question": "A trip curve (time-current curve) shows…",
  "choices": [
   "How long a device takes to open at each current level",
   "The cost of the breaker",
   "Wire color assignments"
  ],
  "answer": "How long a device takes to open at each current level",
  "why": "Overlaying trip curves is how engineers verify selective coordination.",
  "difficulty": "medium",
  "category": "OCP",
  "skin": "theory"
 },
 {
  "question": "For continuous loads, a circuit should be loaded to no more than…",
  "choices": [
   "80% of the breaker rating",
   "100% of the breaker rating",
   "120% of the breaker rating"
  ],
  "answer": "80% of the breaker rating",
  "why": "Continuous loads heat things up — the 80% rule keeps margin on the conductors.",
  "difficulty": "hard",
  "category": "OCP",
  "skin": "theory"
 },
 {
  "question": "Why can an oversized breaker be dangerous?",
  "choices": [
   "It may not trip on smaller overloads, letting conductors overheat",
   "It trips too quickly",
   "It uses more energy"
  ],
  "answer": "It may not trip on smaller overloads, letting conductors overheat",
  "why": "Size the breaker to the conductor — protection sized too big protects nothing.",
  "difficulty": "hard",
  "category": "OCP",
  "skin": "theory"
 },
 {
  "question": "A breaker's interrupting rating (AIC) is…",
  "choices": [
   "The maximum fault current it can safely interrupt",
   "Its normal load rating",
   "The number of times it can trip"
  ],
  "answer": "The maximum fault current it can safely interrupt",
  "why": "A breaker facing more fault current than its AIC can fail violently instead of clearing.",
  "difficulty": "hard",
  "category": "OCP",
  "skin": "theory"
 },
 {
  "question": "Selective coordination means…",
  "choices": [
   "The protective device nearest the fault opens first",
   "All devices open at once",
   "The main always opens first"
  ],
  "answer": "The protective device nearest the fault opens first",
  "why": "Coordination confines the outage to the faulted branch and keeps the rest energized.",
  "difficulty": "hard",
  "category": "OCP",
  "skin": "theory"
 },
 {
  "question": "If a branch-circuit fault trips the building main instead of the branch breaker, the system is…",
  "choices": [
   "Poorly coordinated",
   "Well coordinated",
   "Working as intended"
  ],
  "answer": "Poorly coordinated",
  "why": "Coordination failure blacks out the whole building for a single branch fault.",
  "difficulty": "hard",
  "category": "OCP",
  "skin": "theory"
 },
 {
  "question": "A circuit serving a continuous load must be sized at…",
  "choices": [
   "125% of the continuous load",
   "100% of the load",
   "80% of the load"
  ],
  "answer": "125% of the continuous load",
  "why": "Loads running 3+ hours are sized at 125% so conductors and breakers don't run hot.",
  "difficulty": "hard",
  "category": "OCP",
  "skin": "theory"
 },
 {
  "question": "The largest continuous load allowed on a 20 A breaker is…",
  "choices": [
   "16 A",
   "20 A",
   "25 A"
  ],
  "answer": "16 A",
  "why": "80% of 20 A — continuous heating needs headroom, so 4 A stays in reserve.",
  "difficulty": "hard",
  "category": "OCP",
  "skin": "theory"
 },
 {
  "question": "An EV charger drawing 32 A continuously needs a circuit rated at least…",
  "choices": [
   "40 A",
   "32 A",
   "35 A"
  ],
  "answer": "40 A",
  "why": "Continuous means 125%: 32 x 1.25 = 40 A — the classic modern 80%-rule application.",
  "difficulty": "hard",
  "category": "OCP",
  "skin": "theory"
 },
 {
  "question": "A breaker with a 10 kA interrupting rating installed where 22 kA of fault current is available…",
  "choices": [
   "Is misapplied and can fail violently on a fault",
   "Is fine — it will just trip slower",
   "Upgrades itself under load"
  ],
  "answer": "Is misapplied and can fail violently on a fault",
  "why": "AIC must meet or exceed available fault current — an underrated device can rupture instead of clearing.",
  "difficulty": "hard",
  "category": "OCP",
  "skin": "theory"
 },
 {
  "question": "Available fault current is highest…",
  "choices": [
   "Close to the service and transformer, dropping as conductor length adds impedance",
   "At the farthest receptacle",
   "At the smallest breaker"
  ],
  "answer": "Close to the service and transformer, dropping as conductor length adds impedance",
  "why": "Every foot of wire adds impedance — main gear needs the big interrupting ratings.",
  "difficulty": "hard",
  "category": "OCP",
  "skin": "theory"
 },
 {
  "question": "Which device family typically offers the highest interrupting ratings?",
  "choices": [
   "Current-limiting fuses",
   "Standard molded-case breakers",
   "Snap switches"
  ],
  "answer": "Current-limiting fuses",
  "why": "Current-limiting fuses clear enormous faults in under a half-cycle — a common fix where fault current is huge.",
  "difficulty": "hard",
  "category": "OCP",
  "skin": "theory"
 },
 {
  "question": "For selective coordination, at every fault level the upstream device must be…",
  "choices": [
   "Slower than the downstream device protecting the faulted circuit",
   "Faster than the downstream device",
   "The same speed"
  ],
  "answer": "Slower than the downstream device protecting the faulted circuit",
  "why": "The device nearest the fault clears it; upstream waits — that ordering is read off overlaid trip curves.",
  "difficulty": "hard",
  "category": "OCP",
  "skin": "theory"
 },
 {
  "question": "Selective coordination matters most in…",
  "choices": [
   "Emergency and life-safety systems, where one fault must not black out everything",
   "Storage sheds",
   "Holiday lighting"
  ],
  "answer": "Emergency and life-safety systems, where one fault must not black out everything",
  "why": "Hospitals and egress power cannot lose the whole panel to one branch fault — coordination is required there.",
  "difficulty": "hard",
  "category": "OCP",
  "skin": "theory"
 },
 {
  "question": "The arc flash boundary is the distance where incident energy falls to…",
  "choices": [
   "1.2 cal/cm2 — the onset of a second-degree burn",
   "100 cal/cm2",
   "Zero"
  ],
  "answer": "1.2 cal/cm2 — the onset of a second-degree burn",
  "why": "Cross the boundary unprotected and a curable burn becomes the best case — PPE or distance, pick one.",
  "difficulty": "hard",
  "category": "OCP",
  "skin": "theory"
 },
 {
  "question": "Arc-rated PPE categories 1 through 4 are ranked by…",
  "choices": [
   "The incident energy (cal/cm2) the gear can withstand",
   "Cost",
   "Weight only"
  ],
  "answer": "The incident energy (cal/cm2) the gear can withstand",
  "why": "Higher category, higher cal/cm2 rating — matched to the calculated energy at working distance.",
  "difficulty": "hard",
  "category": "OCP",
  "skin": "theory"
 },
 {
  "question": "Arc flash incident energy grows with…",
  "choices": [
   "Available fault current and how long the device takes to clear",
   "Ambient light",
   "Conductor color"
  ],
  "answer": "Available fault current and how long the device takes to clear",
  "why": "Energy = power x time: big current plus slow clearing is the worst combination on the label.",
  "difficulty": "hard",
  "category": "OCP",
  "skin": "theory"
 },
 {
  "question": "One effective way to reduce arc flash energy at a panel is…",
  "choices": [
   "Faster-clearing overcurrent protection upstream",
   "A bigger breaker",
   "Painting the gear"
  ],
  "answer": "Faster-clearing overcurrent protection upstream",
  "why": "Cut the clearing time and you cut the energy — maintenance switches and current-limiting devices exist for this.",
  "difficulty": "hard",
  "category": "OCP",
  "skin": "theory"
 },
 {
  "question": "Moving farther from a potential arc source…",
  "choices": [
   "Reduces incident energy at your body",
   "Increases it",
   "Changes nothing"
  ],
  "answer": "Reduces incident energy at your body",
  "why": "Energy falls off rapidly with distance — remote racking and long-handled tools are energy controls.",
  "difficulty": "hard",
  "category": "OCP",
  "skin": "theory"
 },
 {
  "question": "The only way to fully eliminate arc flash risk from a task is…",
  "choices": [
   "An electrically safe work condition — de-energize, LOTO, verify zero",
   "Category 4 PPE",
   "Working faster"
  ],
  "answer": "An electrically safe work condition — de-energize, LOTO, verify zero",
  "why": "PPE limits the burn; de-energizing removes it — PPE is the last resort, not the plan.",
  "difficulty": "hard",
  "category": "OCP",
  "skin": "theory"
 },
 {
  "question": "A breaker's thermal element handles overloads; its magnetic (instantaneous) element…",
  "choices": [
   "Trips with no intentional delay on short-circuit-level current",
   "Adds a delay to faults",
   "Charges the spring"
  ],
  "answer": "Trips with no intentional delay on short-circuit-level current",
  "why": "Two sensors in one device: slow heat for overloads, instant magnetics for faults.",
  "difficulty": "hard",
  "category": "OCP",
  "skin": "theory"
 },
 {
  "question": "Arc flash PPE is selected based on…",
  "choices": [
   "The incident energy at the working distance",
   "The color of the panel",
   "The time of day"
  ],
  "answer": "The incident energy at the working distance",
  "why": "PPE is rated in cal/cm² — it must meet or exceed the calculated incident energy.",
  "difficulty": "hard",
  "category": "SITE",
  "skin": "both"
 },
 {
  "question": "The purpose of an arc flash boundary is…",
  "choices": [
   "Only protected workers inside that distance",
   "A place to store tools",
   "Marking where to stand for a better view"
  ],
  "answer": "Only protected workers inside that distance",
  "why": "Inside the boundary, incident energy can exceed 1.2 cal/cm² — PPE required.",
  "difficulty": "medium",
  "category": "SITE",
  "skin": "both"
 },
 {
  "question": "Only who may work on energized electrical equipment?",
  "choices": [
   "Qualified persons with proper PPE and permits",
   "Anyone with insulated gloves",
   "The newest crew member"
  ],
  "answer": "Qualified persons with proper PPE and permits",
  "why": "Energized work takes training, a permit, and arc-rated PPE — qualified persons only.",
  "difficulty": "medium",
  "category": "ELEC",
  "skin": "both"
 },
 {
  "question": "Lockout/tagout (LOTO) means…",
  "choices": [
   "De-energize and lock equipment before servicing it",
   "Locking the gate at night",
   "Tagging broken tools"
  ],
  "answer": "De-energize and lock equipment before servicing it",
  "why": "Lock it, tag it, and verify zero energy before you touch it.",
  "difficulty": "easy",
  "category": "ELEC",
  "skin": "both"
 }
];
