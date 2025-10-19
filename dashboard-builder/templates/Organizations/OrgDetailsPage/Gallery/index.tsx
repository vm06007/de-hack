import Image from "@/components/Image";

const Gallery = ({}) => {
    return (
        <div className="relative mt-12 max-lg:mt-8">
            <div className="relative h-150 max-lg:h-120 max-md:h-64 rounded-4xl overflow-hidden">
                <Image
                    className="object-cover"
                    fill
                    src="/images/gallery-pic-1.png"
                    alt="Hackathon Hero Image"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority
                />
            </div>
        </div>
    );
};

export default Gallery;
