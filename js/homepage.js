/**
 * CK STYLE - Homepage Dynamic Content
 * Loads random featured product and handles animations
 */

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize GSAP
    gsap.registerPlugin(ScrollTrigger);

    // Animate elements on load
    gsap.from('[data-gsap="fadeUp"]', {
        y: 60,
        opacity: 0,
        duration: 1,
        stagger: (i, target) => {
            const delay = target.getAttribute('data-delay');
            return delay ? parseFloat(delay) : 0.2;
        },
        ease: "power3.out"
    });

    // Scroll-triggered animations
    gsap.utils.toArray('[data-gsap="scale"]').forEach(elem => {
        gsap.from(elem, {
            scale: 0.9,
            opacity: 0,
            duration: 1,
            scrollTrigger: {
                trigger: elem,
                start: "top 80%",
                toggleActions: "play none none reverse"
            }
        });
    });

    // Load featured product
    await loadFeaturedProduct();
});

async function loadFeaturedProduct() {
    const container = document.getElementById('product-container');

    try {
        // Wait for Supabase
        if (!window.supabaseClient) {
            await new Promise(resolve => {
                const check = setInterval(() => {
                    if (window.supabaseClient) {
                        clearInterval(check);
                        resolve();
                    }
                }, 100);
            });
        }

        const supabase = window.supabaseClient;

        // Fetch all published products
        const { data: products, error } = await supabase
            .from('collections')
            .select('*, collection_images(image_url)')
            .eq('visibility', 'published')
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!products || products.length === 0) {
            container.innerHTML = `
                <div class="alert alert-warning">
                    <p class="mb-0">No products available at the moment. Check back soon!</p>
                </div>
            `;
            return;
        }

        // Select a random product
        const randomProduct = products[Math.floor(Math.random() * products.length)];

        // Get product images
        const images = [];
        if (randomProduct.image_url) images.push(randomProduct.image_url);
        if (randomProduct.collection_images) {
            randomProduct.collection_images.forEach(img => {
                if (img.image_url) images.push(img.image_url);
            });
        }

        const coverImage = images[0] || 'https://via.placeholder.com/800x1200?text=CK+STYLE';
        const priceFormatted = randomProduct.price_fcfa
            ? new Intl.NumberFormat().format(randomProduct.price_fcfa) + ' FCFA'
            : 'Price on Request';

        // Render product card
        container.innerHTML = `
            <div class="row justify-content-center">
                <div class="col-lg-6 col-md-8">
                    <div class="showcase-card">
                        <div class="showcase-img">
                            <img src="${coverImage}" alt="${randomProduct.title}" 
                                onerror="this.src='https://via.placeholder.com/800x1200?text=CK+STYLE'">
                            <div class="showcase-badge">${randomProduct.category || 'Collection'}</div>
                            <div class="showcase-price">${priceFormatted}</div>
                        </div>
                        <div class="p-4">
                            <h3 class="h3 mb-3">${randomProduct.title}</h3>
                            <p class="text-muted mb-4">${randomProduct.description || 'A timeless masterpiece of style and elegance.'}</p>
                            <div class="d-grid gap-2">
                                <a href="collection.html" class="btn btn-primary btn-lg">View Full Collection</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Animate product card entrance
        gsap.from('.showcase-card', {
            y: 50,
            opacity: 0,
            duration: 1,
            ease: "power3.out"
        });

    } catch (error) {
        console.error('Failed to load featured product:', error);
        container.innerHTML = `
            <div class="alert alert-danger">
                <p class="mb-0">Failed to load featured product. Please refresh the page.</p>
            </div>
        `;
    }
}

// Initialize Testimonials Swiper
function initTestimonialsSwiper() {
    new Swiper('.testimonials-swiper', {
        slidesPerView: 1,
        spaceBetween: 30,
        loop: true,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        breakpoints: {
            640: {
                slidesPerView: 1,
            },
            768: {
                slidesPerView: 2,
            },
            1024: {
                slidesPerView: 3,
            },
        },
        speed: 800,
    });
}

// Initialize swiper after DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTestimonialsSwiper);
} else {
    initTestimonialsSwiper();
}
