/**
 * Signals that a vote deserves a second look.
 *
 * None of these prove anything on their own — a family shares an IP, and two
 * friends vote a minute apart. They exist so a suspicious *pattern* stands out
 * in a list of hundreds, which is the difference between having the data and
 * being able to act on it.
 */

export type VoteFlag = "SHARED_IP" | "BURST" | "DISPOSABLE" | "UNDELIVERABLE";

export const FLAG_LABEL: Record<VoteFlag, string> = {
  SHARED_IP: "Same network as another vote",
  BURST: "Cast seconds after another vote",
  DISPOSABLE: "Throwaway email domain",
  UNDELIVERABLE: "Address looks unroutable",
};

/** Domains that exist to be thrown away after one use. */
const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "10minutemail.com",
  "tempmail.com",
  "temp-mail.org",
  "throwawaymail.com",
  "yopmail.com",
  "trashmail.com",
  "sharklasers.com",
  "getnada.com",
  "dispostable.com",
  "maildrop.cc",
  "fakeinbox.com",
  "mailnesia.com",
  "tempr.email",
]);

/** Placeholder domains that cannot receive mail. */
const UNROUTABLE_DOMAINS = new Set([
  "example.com",
  "example.org",
  "example.net",
  "test.com",
  "localhost",
  "invalid",
]);

/** Votes cast within this window of each other on one network look automated. */
const BURST_MS = 30_000;

interface VoteLike {
  id: string;
  voterEmail: string;
  ip: string | null;
  createdAt: Date;
}

/**
 * Returns flags per vote id. Compares each vote against the others in the same
 * contest, so it needs the whole set rather than one row at a time.
 */
export function flagVotes<T extends VoteLike>(votes: T[]): Map<string, VoteFlag[]> {
  const flags = new Map<string, VoteFlag[]>();
  const add = (id: string, flag: VoteFlag) => {
    const list = flags.get(id) ?? [];
    if (!list.includes(flag)) list.push(flag);
    flags.set(id, list);
  };

  // Group by network prefix; the stored IP is already truncated.
  const byIp = new Map<string, T[]>();
  for (const vote of votes) {
    if (!vote.ip) continue;
    const group = byIp.get(vote.ip) ?? [];
    group.push(vote);
    byIp.set(vote.ip, group);
  }

  for (const group of byIp.values()) {
    if (group.length < 2) continue;

    for (const vote of group) add(vote.id, "SHARED_IP");

    const ordered = [...group].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );
    for (let i = 1; i < ordered.length; i++) {
      const gap =
        ordered[i].createdAt.getTime() - ordered[i - 1].createdAt.getTime();
      if (gap <= BURST_MS) {
        add(ordered[i].id, "BURST");
        add(ordered[i - 1].id, "BURST");
      }
    }
  }

  for (const vote of votes) {
    const domain = vote.voterEmail.split("@")[1]?.toLowerCase();
    if (!domain) continue;
    if (DISPOSABLE_DOMAINS.has(domain)) add(vote.id, "DISPOSABLE");
    if (UNROUTABLE_DOMAINS.has(domain)) add(vote.id, "UNDELIVERABLE");
  }

  return flags;
}
