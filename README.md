# distance-pair-sampler

CLI that builds number pairs from digits 1-9 and draws one congruent plus one incongruent trial per numerical distance. Writes two Excel files.

## Stack

- Node.js >= 20
- TypeScript
- tsx
- exceljs
- vitest, fast-check

## Run

Needs Node.js 20+ (ships `npm`). On Windows install it from [nodejs.org](https://nodejs.org/) and open a new terminal.

Download without Git: on the GitHub repo page click the green **Code** button, then **Download ZIP**. Unzip it. The folder is `distance-pair-sampler-main`. Open a terminal in that folder:

```sh
cd distance-pair-sampler-main
npm install
npm start
```

Or clone with Git (install Git from [git-scm.com](https://git-scm.com/download/win) on Windows if you use this):

```sh
git clone https://github.com/ozgurvurgun/distance-pair-sampler.git
cd distance-pair-sampler
npm install
npm start
```

Works in PowerShell, cmd, and bash. 70 blocks, `crypto.randomInt`, files in `output/` inside the project folder:

```
output/smartlab_20260902-223205_congruent_trials.xlsx
output/smartlab_20260902-223205_incongruent_trials.xlsx
```

Each run uses a new timestamp, so the last draw stays on disk.

`ITERATIONS` defaults to 70. `OUTPUT_DIR` defaults to `output`.

```sh
ITERATIONS=1 npm start
```

PowerShell: `$env:ITERATIONS=1; npm start`

## How it picks

Pool is digits 1-9, left != right. Ordered pairs, so `1_2` and `2_1` are both in. `9*8 = 72`.

Distance is `|left-right|` (1..8). Congruent = smaller on the left (`1_2`). Incongruent = larger on the left (`2_1`).

Bucket size is `9-d` per condition. Distance 1 has 8+8. Distance 8 is only `1_9` / `9_1`.

A block walks d=1..8 and picks one congruent and one incongruent from that bucket. 16 trials per block. The two sides are independent draws. `2_3` does not have to pair with `3_2`. Sampling is with replacement, so the same pair can show up again later.

Default is 70 blocks. Each sheet then has 70 labels (`A2`..`A71`).

Draws use `crypto.randomInt(0, n)`. No seed. Every run is a new list.

## Excel

Two files, same layout. Sheets are `1-congruent` .. `8-congruent` (other file: `1-incongruent` .. `8-incongruent`). Column A only.

- `A1`: distance (`"1"` .. `"8"`)
- `A2` onward: `left_right` labels, one block per row

The same row index is the same block in both files.

Flow charts: [docs/how-it-works.md](docs/how-it-works.md)
