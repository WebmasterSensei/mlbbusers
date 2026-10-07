import Image from "next/image";
import Link from "next/link";
import { Panel } from "@/components/ui/Panel";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Portrait } from "@/components/ui/Portrait";
import { formatPercent } from "@/lib/labels";
import type { Hero, HeroRef } from "@/types/mlbb";

interface RelationView {
  desc: string;
  heroes: HeroRef[];
}

export function HeroDetail({
  hero,
  relations,
}: {
  hero: Hero;
  relations: { strong: RelationView; weak: RelationView; assist: RelationView };
}) {
  return (
    <div className="flex flex-col gap-4">
      <Panel padded={false} className="overflow-hidden">
        <div className="relative flex min-h-[15rem] flex-col justify-end gap-4 p-6 sm:flex-row sm:items-end">
          {hero.painting || hero.portrait ? (
            <Image
              src={hero.painting || hero.portrait}
              alt=""
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="pointer-events-none object-contain object-right-bottom opacity-40 [mask-image:linear-gradient(to_left,black_35%,transparent_95%)]"
            />
          ) : null}

          <div className="relative z-10 flex items-center gap-4">
            <Portrait src={hero.portrait || null} alt={hero.name} size={88} frame="gold" priority />
            <div className="min-w-0">
              <Eyebrow>{hero.role === "All" ? "Flexible" : hero.role}</Eyebrow>
              <h1 className="mt-1 font-display text-4xl font-black uppercase tracking-tight text-gold-gradient">
                {hero.name}
              </h1>
              <p className="mt-1 text-xs text-ink-400">
                {hero.lanes.length > 0 ? hero.lanes.join(" / ") : "No lane data"}
              </p>
            </div>
          </div>

          <div className="relative z-10 sm:ml-auto">
            <Eyebrow className="tracking-[0.2em]">Difficulty</Eyebrow>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-1.5 w-32 overflow-hidden bg-abyss-950">
                <div
                  className="h-full bg-gradient-to-r from-gold-600 to-gold-400"
                  style={{ width: `${Math.min(100, (hero.difficulty / 10) * 100)}%` }}
                />
              </div>
              <span className="font-display text-sm font-bold tabular-nums text-ink-200">
                {hero.difficulty}/10
              </span>
            </div>
          </div>
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Ranked Data" eyebrow="All tiers">
          <div className="flex flex-col gap-3">
            <StatBar label="Win rate" value={hero.stats.winRate} color="#34d399" />
            <StatBar label="Pick rate" value={hero.stats.pickRate} color="#38bdf8" />
            <StatBar label="Ban rate" value={hero.stats.banRate} color="#f87171" />
          </div>
          <p className="mt-4 text-[11px] leading-relaxed text-ink-400">
            Rates are rounded by the game&apos;s API and can be missing for heroes with little
            ranked play.
          </p>
        </Panel>

        <Panel title="Specialties" eyebrow="Playstyle" className="lg:col-span-2">
          {hero.specialties.length === 0 ? (
            <p className="text-sm text-ink-400">No specialty data for this hero.</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {hero.specialties.map((s) => (
                <li
                  key={s}
                  className="clip-notch-sm glass-subtle px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-gold-200 ring-1 ring-inset ring-white/10"
                >
                  {s}
                </li>
              ))}
            </ul>
          )}
          {hero.story ? (
            <p className="mt-4 line-clamp-6 text-sm leading-relaxed text-ink-300">{hero.story}</p>
          ) : null}
          {hero.loreUrl ? (
            <a
              href={hero.loreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-[11px] font-semibold uppercase tracking-widest text-gold-400 hover:text-gold-300"
            >
              Full lore
            </a>
          ) : null}
        </Panel>
      </div>

      <Panel title="Skills" eyebrow="Abilities">
        {hero.skills.length === 0 ? (
          <p className="text-sm text-ink-400">No skill data for this hero.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {hero.skills.map((skill, i) => (
              <li
                key={`${skill.name}-${i}`}
                className="clip-notch-sm flex gap-3 glass-subtle p-3 ring-1 ring-inset ring-white/10"
              >
                {skill.icon ? (
                  <Image
                    src={skill.icon}
                    alt=""
                    width={44}
                    height={44}
                    className="size-11 shrink-0 rounded-sm object-cover"
                  />
                ) : (
                  <span className="grid size-11 shrink-0 place-items-center rounded-sm bg-abyss-800 text-[10px] font-bold text-ink-400">
                    {i + 1}
                  </span>
                )}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-sm font-semibold text-ink-100">
                      {skill.name}
                    </span>
                    {skill.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-sm bg-gold-500/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-gold-300"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-ink-400">{skill.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <div className="grid gap-4 md:grid-cols-3">
        <RelationPanel title="Strong Against" tone="text-victory" relation={relations.strong} />
        <RelationPanel title="Weak Against" tone="text-defeat" relation={relations.weak} />
        <RelationPanel title="Good With" tone="text-arcane-400" relation={relations.assist} />
      </div>
    </div>
  );
}

function StatBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number | null;
  color: string;
}) {
  const pct = value ?? 0;
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">
          {label}
        </span>
        <span className="font-display text-sm font-bold tabular-nums text-ink-100">
          {value === null ? "—" : formatPercent(value)}
        </span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden bg-abyss-950">
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.min(100, pct)}%`,
            background: `linear-gradient(90deg, ${color}55, ${color})`,
          }}
        />
      </div>
    </div>
  );
}

function RelationPanel({
  title,
  tone,
  relation,
}: {
  title: string;
  tone: string;
  relation: RelationView;
}) {
  return (
    <Panel title={title} eyebrow="Synergy">
      {relation.desc ? (
        <p className="mb-3 text-xs leading-relaxed text-ink-400">{relation.desc}</p>
      ) : null}
      {relation.heroes.length === 0 ? (
        <p className="text-sm text-ink-400">No data.</p>
      ) : (
        <ul className="flex flex-wrap gap-2.5">
          {relation.heroes.map((h) => (
            <li key={h.id}>
              <Link
                href={`/heroes/${h.id}`}
                className="group flex w-14 flex-col items-center gap-1.5 text-center"
              >
                <span className="clip-notch-sm relative block size-14 overflow-hidden glass-subtle ring-1 ring-inset ring-white/10 transition group-hover:ring-gold-400/50">
                  {h.portrait ? (
                    <Image src={h.portrait} alt={h.name} fill sizes="56px" className="object-cover" />
                  ) : null}
                </span>
                <span className={`w-full truncate text-[10px] font-semibold ${tone}`}>{h.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
