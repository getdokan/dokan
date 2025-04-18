export function truncateWords( title: string, length: number = 60 ): string {
    const extractedString = title?.substr( 0, length );
    return extractedString?.length >= length
        ? `${ extractedString }...`
        : extractedString;
}
