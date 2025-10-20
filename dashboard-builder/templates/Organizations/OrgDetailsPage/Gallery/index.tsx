import Image from "@/components/Image";

type Props = { coverUrl?: string };

const Gallery = ({ coverUrl }: Props) => {
    return (
        <div className="relative mt-12 max-lg:mt-8">
            <div className="relative h-50 max-lg:h-50 max-md:h-64 rounded-4xl overflow-hidden">
                <Image
                    className="object-cover"
                    fill
                    src={coverUrl || "/images/hackathons/1.jpg"}
                    alt="Hackathon Hero Image"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority
                    quality={100}
                />
            </div>
        </div>
    );
};

export default Gallery;
