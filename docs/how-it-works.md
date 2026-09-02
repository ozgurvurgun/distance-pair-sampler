# How it works

How the pool is built, what one block draws, and where those values land in Excel.

## End to end

After ZIP or clone: `npm install`, then `npm start`.

```mermaid
flowchart TD
  A["npm start"] --> B["72-pair pool"]
  B --> C["sample N blocks, default 70"]
  C --> D["each block: 8 congruent + 8 incongruent"]
  D --> E["output/smartlab_YYYYMMDD-HHMMSS_congruent_trials.xlsx"]
  D --> F["output/smartlab_YYYYMMDD-HHMMSS_incongruent_trials.xlsx"]
```

`ITERATIONS` defaults to 70. `OUTPUT_DIR` defaults to `output`. RNG is `crypto.randomInt`. Both files from one run share the same timestamp.

## Pool: 72 pairs

```mermaid
flowchart TD
  A["Digit 1..9"] --> B["every left x every right"]
  B --> C{"left == right?"}
  C -->|yes| D["skip"]
  C -->|no| E["Stimulus left_right"]
  E --> F["distance = |left-right|"]
  E --> G{"left < right?"}
  G -->|yes| H["congruent bucket d"]
  G -->|no| I["incongruent bucket d"]
```

Example: `2_5` is d=3, congruent. `5_2` is d=3, incongruent. `1_1` is not in the pool.

Bucket size is `9-d`. Distance 8 has one pair: `1_9` / `9_1`.

## One block

```mermaid
flowchart TD
  A["sampleBlock i"] --> B["d = 1"]
  B --> C["pick congruent, d"]
  C --> D["pick incongruent, d"]
  D --> E{"d < 8?"}
  E -->|yes| F["d = d+1"]
  F --> C
  E -->|no| G["TrialBlock: 8+8"]
```

`pick`:

```mermaid
flowchart TD
  A["candidates d, condition"] --> B["n = length"]
  B --> C["i = random.nextInt n"]
  C --> D["return candidates i"]
```

`i` comes from `crypto.randomInt(0, n)`. Congruent and incongruent are separate calls. A pair is not tied to its reverse. The same pair can appear in a later block.

70 blocks means this loop runs 70 times. Those 70 labels are `A2`..`A71` on that sheet.

## Excel write

```mermaid
flowchart TD
  A["export SamplingRun"] --> B["mkdir OUTPUT_DIR"]
  B --> C["condition = congruent"]
  C --> D["workbook"]
  D --> E["sheet d-condition"]
  E --> F["A1 = d"]
  F --> G["A2.. = block 0..N-1 labels"]
  G --> H{"d < 8?"}
  H -->|yes| E
  H -->|no| I["write xlsx"]
  I --> J{"incongruent written?"}
  J -->|no| K["condition = incongruent"]
  K --> D
  J -->|yes| L["return both paths"]
```

Same row number is the same block in both files. Sheet names: `1-congruent` .. `8-congruent` / `1-incongruent` .. `8-incongruent`.
