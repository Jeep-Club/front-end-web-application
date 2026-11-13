import type { BirthdayUser } from "@/schemas/identity/birthdays";

export interface UpcomingBirthday extends BirthdayUser {
    date: Date;
}

export function getUpcomingBirthdaysForMonth(
    users: BirthdayUser[],
    referenceDate: Date,
    limit = 3,
): UpcomingBirthday[] {
    const year = referenceDate.getFullYear();
    const month = referenceDate.getMonth();
    const startOfToday = new Date(year, month, referenceDate.getDate());

    return users
        .filter((user) => user.birthMonth === month + 1 && user.birthDay !== null)
        .map((user) => {
            const monthLength = new Date(year, month + 1, 0).getDate();
            return {
                ...user,
                date: new Date(year, month, Math.min(user.birthDay ?? 1, monthLength)),
            };
        })
        .filter((user) => user.date >= startOfToday)
        .sort((first, second) => first.date.getTime() - second.date.getTime())
        .slice(0, limit);
}

export function getBirthdaysOnDate(users: BirthdayUser[], date: Date): BirthdayUser[] {
    return users.filter((user) =>
        user.birthMonth === date.getMonth() + 1
        && (user.birthDay === date.getDate() || (
            user.birthMonth === 2
            && user.birthDay === 29
            && date.getMonth() === 1
            && date.getDate() === 28
            && new Date(date.getFullYear(), 1, 29).getDate() !== 29
        ))
    );
}
