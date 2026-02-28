/**
 * CK STYLE - Homepage Dynamic Content
 * Loads all published collections in the same grid layout as the collection page
 */

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize GSAP
    gsap.registerPlugin(ScrollTrigger);

    // Animate elements on load
    gsap.from('[data-gsap="fadeUp"]', {
        y: 20,
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
            y: 20,
            opacity: 0,
            duration: 1,
            scrollTrigger: {
                trigger: elem,
                start: "top 85%",
                toggleActions: "play none none reverse"
            }
        });
    });

    // Load collections
    await loadFeaturedCollections();
});

async function loadFeaturedCollections() {
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

        // Fetch all published collections with images
        const { data: products, error } = await supabase
            .from('collections')
            .select('*, collection_images(image_url)')
            .eq('visibility', 'published')
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!products || products.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <p class="text-muted mb-0">No masterpieces available at the moment. Check back soon!</p>
                </div>
            `;
            return;
        }

        // Build all images for a collection
        function getCollectionImages(item) {
            const images = [];
            if (item.image_url) images.push(item.image_url);
            if (item.collection_images) {
                item.collection_images.forEach(ci => {
                    if (ci.image_url) images.push(ci.image_url);
                });
            }
            return images.filter(u => u && u.trim().length > 2).map(u => u.trim());
        }

        // Clear skeleton
        container.innerHTML = '';

        // Render each collection in the same style as collection.html
        products.forEach((item, collIdx) => {
            const images = getCollectionImages(item);
            if (images.length === 0) return;

            const priceFormatted = item.price_fcfa
                ? new Intl.NumberFormat().format(item.price_fcfa) + ' FCFA'
                : 'Price on Request';

            // WhatsApp link
            const waText = encodeURIComponent(
                `Hi CK STYLE! I'm interested in "${item.title}" (${priceFormatted}). Please tell me more!`
            );
            const waLink = `https://wa.me/237671002411?text=${waText}`;

            // Build collection section
            const section = document.createElement('div');
            section.className = 'collection-section';
            section.setAttribute('data-cat', item.category);

            section.innerHTML = `
                <div class="collection-header">
                    <div class="collection-header-left">
                        <div class="collection-category">${item.category || 'Collection'}</div>
                        <h2 class="collection-name">${item.title}</h2>
                    </div>
                    <div class="collection-price">${priceFormatted}</div>
                </div>
                <div class="collection-images row row-cols-2 row-cols-sm-3 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-2 g-md-3" id="home-coll-grid-${collIdx}"></div>
                <a href="${waLink}" target="_blank" class="collection-wa-btn">
                    💬 Inquire about this piece
                </a>
            `;

            container.appendChild(section);

            // Populate images
            const grid = document.getElementById(`home-coll-grid-${collIdx}`);
            images.forEach((url, imgIdx) => {
                const col = document.createElement('div');
                col.className = 'col';
                col.innerHTML = `
                    <a href="collection.html" class="collection-img-wrap" style="text-decoration:none;">
                        <img src="${url}" alt="${item.title} - Image ${imgIdx + 1}" loading="lazy"
                             onerror="this.src='https://via.placeholder.com/600x800?text=Image+Unavailable'">
                        <span class="img-view-icon">🔍</span>
                        ${images.length > 1 ? `<span class="img-number">${imgIdx + 1}/${images.length}</span>` : ''}
                    </a>
                `;
                grid.appendChild(col);
            });

            // Staggered reveal animation
            requestAnimationFrame(() => {
                setTimeout(() => {
                    section.classList.add('revealed');
                }, collIdx * 120);
            });
        });

        // Add a "View Full Collection" button at the bottom
        const viewAllBtn = document.createElement('div');
        viewAllBtn.className = 'text-center mt-5';
        viewAllBtn.innerHTML = `
            <a href="collection.html" class="btn btn-primary btn-lg px-5">View Full Collection</a>
        `;
        container.appendChild(viewAllBtn);

    } catch (error) {
        console.error('Failed to load collections:', error);
        container.innerHTML = `
            <div class="alert alert-danger">
                <p class="mb-0">Failed to load collections. Please refresh the page.</p>
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
