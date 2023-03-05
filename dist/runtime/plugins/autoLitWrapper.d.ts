import type { NuxtSsrLitOptions } from "../../module";
export default function autoLitWrapper({ litElementPrefix }: NuxtSsrLitOptions): {
    name: string;
    transform(code: string, id: string): Promise<{
        code: string;
        map: null;
    } | undefined>;
};
