import { Fragment } from "react";
import { Image } from "@unpic/react";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

export type NewsItem = {
    id: string;
    title: string;
    article: string;
};

export const NEWS: NewsItem[] = [
    {
        id: "1",
        title: "Lorem ipsum dolor sit amet, consectetur.",
        article:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor.",
    },
    {
        id: "2",
        title: "Dapatkan cashback 25%!",
        article:
            "Gunakan Kode Affiliate untuk ajak teman bertumbuh bersama",
    },
];

export const UserNews = () => {
    return (
        <section className="bg-neutral-100 rounded-2xl border border-neutral-300 p-6">
            <h2 className="mb-2 font-medium">Berita khusus untukmu</h2>
            <div className="flex gap-4">
                <div className="flex flex-col lg:flex-row gap-4 w-full">
                    <NewsList items={NEWS} />
                </div>
            </div>
        </section>
    );
};

const NewsList = ({ items }: { items: NewsItem[] }) => {
    return (
        <Fragment>
            {items.map((item, idx) => {
                const isPrimary = idx === 0;
                return (
                    <div
                        key={item.id}
                        className={
                            isPrimary
                                ? "relative flex flex-col w-full lg:w-7/10 min-h-40 gap-2 lg:gap-4 overflow-clip rounded-md bg-secondary-400 border border-secondary-700 p-4 text-neutral-1000"
                                : "relative flex flex-col grow min-h-40 gap-2 lg:gap-4 overflow-clip rounded-md bg-red-100 border border-red-200 p-4 text-neutral-1000"
                        }
                    >
                        <h3 className={isPrimary ? "font-bold text-lg lg:text-2xl z-10" : "font-bold text-lg lg:text-2xl z-10 pr-40 lg:pr-0"}>{item.title}</h3>
                        <p className={isPrimary ? "lg:max-w-8/10 text-sm lg:text-lg z-10" : "max-w-1/2 text-sm lg:text-lg z-10"}>
                            {item.article}
                        </p>

                        {isPrimary && (
                            <div className="absolute bottom-[73%] right-3 lg:bottom-[55%] w-10 h-10 z-0 rounded-full bg-secondary-600 border border-secondary-700" />
                        )}

                        {isPrimary && (
                            <div className="absolute -bottom-1/3 -right-1/5 lg:-bottom-1/2 lg:-right-[5%] w-45 h-45 lg:w-50 lg:h-50 z-0 rounded-full bg-secondary-600 border border-secondary-700" />
                        )}

                        {!isPrimary && (
                            <Image
                                src="/avatar/news-avatar.webp"
                                width={300}
                                height={300}
                                className="absolute -right-1/3 -bottom-4/5 lg:-right-[15%] lg:-bottom-4/5 sm:-right-[15%] sm:-bottom-0 sm:w-120 w-140 lg:w-90 pointer-events-none z-2"
                            />
                        )}
                        {!isPrimary && (
                            <div className="absolute -bottom-1/3 -right-1/5 lg:-bottom-1/2 lg:-right-[5%] w-45 h-45 lg:w-52 lg:h-52 z-0 rounded-full bg-red-200 border border-red-300" />
                        )}
                        {!isPrimary && (
                            <div className="absolute lg:right-[45%] right-[40%] -bottom-2 w-10 h-10 z-0 rounded-full bg-red-200 border border-red-300" />
                        )}
                        {!isPrimary && (
                            <Link to="/profile">
                                <Button
                                    
                                    className="absolute right-2 bottom-2 z-10 bg-red-300 rounded-md p-2 hover:bg-red-400"
                                >
                                    <ArrowRightIcon weight="bold" className="text-neutral-1000 w-6 h-6" />
                                </Button>
                            </Link>
                        )}

                    </div>
                );
            })}
        </Fragment>
    );
};
