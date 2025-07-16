import React from 'react';
import Image from 'next/image';

const ProductCards = () => {
  const cardData = [
    {
      id: 1,
      title: "TVs FOR EVERY BUDGET | EXPLORE NOW",
      products: [
        {
          name: "Budget TVs",
          image: "/assets/c1.jpg",
          alt: "Budget TV"
        },
        {
          name: "4K Ultra HD TVs",
          image: "/assets/c2.jpg",
          alt: "4K TV"
        },
        {
          name: "Big Display TVs",
          image: "/assets/c3.jpg",
          alt: "Large Screen TV"
        },
        {
          name: "Ultra Premium TVs",
          image: "/assets/c4.jpg",
          alt: "Premium TV"
        }
      ],
      linkText: "See more",
      link:"/category/television"
    },

    {
      id: 2,
      title: "Appliances for home | Up to 55% off",
      products: [
        {
          name: "Air conditioners",
          image: "/assets/c2a.jpg",
          alt: "Air conditioner"
        },
        {
          name: "Refrigerators",
          image: "/assets/c2b.jpg",
          alt: "Refrigerator"
        },
        {
          name: "Microwaves",
          image: "/assets/c2c.jpg",
          alt: "Microwave"
        },
        {
          name: "Washing machines",
          image: "/assets/c2d.jpg",
          alt: "Washing machine"
        }
      ],
      linkText: "See more",
      link:"/category/ac"
    },

    {
      id: 3,
      title: "PlayStation 5 Slim & Accessories ",
      products: [
        {
          name: "PS5 Slim digital edition",
          image: "/assets/c3a.jpg",
          alt: "PS5 Digital"
        },
        {
          name: "PS5 Slim disc edition",
          image: "/assets/c3b.jpg",
          alt: "PS5 Disc"
        },
        {
          name: "PS5 Slim Fortnite digital edition",
          image: "/assets/c3c.jpg",
          alt: "PS5 Fortnite"
        },
        {
          name: "PS5 DualSense Wireless Controller",
          image: "/assets/c3d.jpg",
          alt: "PS5 Controller"
        }
      ],
      linkText: "See more",
      link:"/category/consoles"
    },
    {
      id: 4,
      title: "Best Laptop Deals | Up to 50% Off",
      products: [
        {
          name: "Student Laptops",
          image: "/assets/c7c.jpg",
          alt: "Student Laptop"
        },
        {
          name: "Gaming Laptops",
          image: "/assets/c7a.jpg",
          alt: "Gaming Laptop"
        },
        {
          name: "Business Laptops",
          image: "/assets/c7b.jpg",
          alt: "Business Laptop"
        },
        {
          name: "Touchscreen Laptops",
          image: "/assets/c7d.jpg",
          alt: "Touchscreen Laptop"
        }
      ],
     linkText: "See more",
      link:"/category/laptop"
    },


    {
      id: 5,
      title: "Starting ₹149 | Headphones",
      products: [
        {
          name: "Boat headphones",
          image: "/assets/c4a.jpg",
          alt: "Boat headphones"
        },
        {
          name: "Boult headphones",
          image: "/assets/c4b.jpg",
          alt: "Boult headphones"
        },
        {
          name: "Wireless earbuds",
          image: "/assets/c4c.jpg",
          alt: "Wireless earbuds"
        },
        {
          name: "Premium headphones",
          image: "/assets/c4d.jpg",
          alt: "Premium headphones"
        }
      ],
    linkText: "See more",
      link:"/category/headphones"
    },

    {
      id: 6,
      title: "Automotive essentials | Up to 60% off",
      products: [
        {
          name: "Car accessories",
          image: "/assets/c5a.jpg",
          alt: "Car accessories"
        },
        {
          name: "Bike accessories",
          image: "/assets/c5b.jpg",
          alt: "Bike accessories"
        },
        {
          name: "Car care",
          image: "/assets/c5c.jpg",
          alt: "Car care"
        },
        {
          name: "Helmets & safety",
          image: "/assets/c5d.jpg",
          alt: "Safety gear"
        }
      ],
     linkText: "See more",
      link:"/category/automotive"
    },
    {
      id: 7,
      title: "Revamp your home in style",
      products: [
        {
          name: "Cushion covers, bedsheets & more",
          image: "/assets/c6a.jpg",
          alt: "Bedding"
        },
        {
          name: "Figurines, vases & more",
          image: "/assets/c6b.jpg",
          alt: "Home decor"
        },
        {
          name: "Home storage",
          image: "/assets/c6c.jpg",
          alt: "Storage solutions"
        },
        {
          name: "Lighting solutions",
          image: "/assets/c6d.jpg",
          alt: "Lighting"
        }
      ],
    linkText: "See more",
      link:"/category/home"
    },
    {
      id: 8,
      title: "Under ₹499 | Deals on home ",
      products: [
        {
          name: "Tools & hardware",
          image: "/assets/c8a.jpg",
          alt: "Tools"
        },
        {
          name: "Home improvement",
          image: "/assets/c8b.jpg",
          alt: "Home improvement"
        },
        {
          name: "Cleaning supplies",
          image: "/assets/c8c.jpg",
          alt: "Cleaning"
        },
        {
          name: "Garden & outdoor",
          image: "/assets/c8d.jpg",
          alt: "Garden"
        }
      ],
     linkText: "See more",
      link:"/category/home"
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-5 bg-gray-200 min-h-screen xl:max-w-[98%] 2xl:mt-[-450px] xl:mt-[-325px] lg:mt-[-220px] md:mt-[-140px] z-[9999]">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-8 ">
        {cardData.map((card) => (
          <div
            key={card.id}
            className="bg-gray-100 relative rounded-lg p-5 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-200 sm:h-[450px] md:h-[440px] z-[8]"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-4 leading-tight uppercase">
              {card.title}
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
              {card.products.map((product, index) => (
                <div
                  key={index}
                  className="text-center cursor-pointer hover:scale-105 transition-transform duration-200 p-1"
                >
                  <div className="mb-2">
                    <Image
                      src={product.image}
                      alt={product.alt}
                      width={300}
                      height={240}
                      quality={90}
                      className="w-full h-22 md:h-22 lg:h-26 object-cover rounded bg-gray-50"
                    />


                  </div>
                  <p className="text-xs text-gray-600 leading-tight">
                    {product.name}
                  </p>
                </div>
              ))}
            </div>

            <a
              href={card.link}
              className="text-blue-600 absolute bottom-2 md:bottom-10 hover:text-orange-600 hover:underline text-sm font-medium inline-block mt-2 "
            >
              {card.linkText}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductCards;