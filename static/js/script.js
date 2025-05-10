/**
 * ExamElite - Study Material Sharing Platform
 * Main JavaScript File
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initializeNavbar();
    initializeFileUpload();
    initializeViewToggle();
    initializeTestimonialSlider();
    initializeTooltips();
    initializeDropdowns();
    initializeFormValidation();
    initializeAnimations();
});

/**
 * Mobile navbar toggle functionality
 */
function initializeNavbar() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navbar = document.querySelector('.navbar');
    const overlay = document.createElement('div');
    overlay.classList.add('nav-overlay');
    document.body.appendChild(overlay);

    if (menuToggle && navbar) {
        menuToggle.addEventListener('click', function() {
            navbar.classList.toggle('active');
            document.body.classList.toggle('nav-open');
            overlay.classList.toggle('active');
        });

        overlay.addEventListener('click', function() {
            navbar.classList.remove('active');
            document.body.classList.remove('nav-open');
            overlay.classList.remove('active');
        });

        // Close navbar when clicking outside
        document.addEventListener('click', function(event) {
            if (!navbar.contains(event.target) && !menuToggle.contains(event.target)) {
                navbar.classList.remove('active');
                document.body.classList.remove('nav-open');
                overlay.classList.remove('active');
            }
        });
    }

    // Add fixed navbar on scroll
    const header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                header.classList.add('fixed');
            } else {
                header.classList.remove('fixed');
            }
        });
    }
}

/**
 * File upload functionality
 */
function initializeFileUpload() {
    const fileUploadArea = document.querySelector('.file-upload-area');
    const fileInput = document.querySelector('#file-upload');
    const filePreview = document.querySelector('.file-preview');
    const fileName = document.querySelector('.file-name');
    const fileSize = document.querySelector('.file-size');
    const removeFile = document.querySelector('.remove-file');

    if (fileUploadArea && fileInput) {
        // Handle click on upload area
        fileUploadArea.addEventListener('click', function() {
            fileInput.click();
        });

        // Handle drag and drop
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            fileUploadArea.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            fileUploadArea.addEventListener(eventName, highlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            fileUploadArea.addEventListener(eventName, unhighlight, false);
        });

        function highlight() {
            fileUploadArea.classList.add('dragover');
        }

        function unhighlight() {
            fileUploadArea.classList.remove('dragover');
        }

        // Handle file drop
        fileUploadArea.addEventListener('drop', handleDrop, false);

        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            fileInput.files = files;
            handleFiles(files);
        }

        // Handle file selection
        fileInput.addEventListener('change', function() {
            handleFiles(this.files);
        });

        function handleFiles(files) {
            if (files.length > 0) {
                const file = files[0];
                displayFileInfo(file);
                fileUploadArea.style.display = 'none';
                filePreview.style.display = 'flex';
            }
        }

        function displayFileInfo(file) {
            fileName.textContent = file.name;
            fileSize.textContent = formatFileSize(file.size);
        }

        function formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }

        // Remove file
        if (removeFile) {
            removeFile.addEventListener('click', function(e) {
                e.preventDefault();
                fileInput.value = '';
                filePreview.style.display = 'none';
                fileUploadArea.style.display = 'flex';
            });
        }
    }
}

/**
 * Toggle between grid and list view
 */
function initializeViewToggle() {
    const gridViewBtn = document.querySelector('.view-option[data-view="grid"]');
    const listViewBtn = document.querySelector('.view-option[data-view="list"]');
    const materialsContainer = document.querySelector('.materials-container');

    if (gridViewBtn && listViewBtn && materialsContainer) {
        gridViewBtn.addEventListener('click', function() {
            materialsContainer.classList.add('grid-view');
            materialsContainer.classList.remove('list-view');
            gridViewBtn.classList.add('active');
            listViewBtn.classList.remove('active');
            localStorage.setItem('preferredView', 'grid');
        });

        listViewBtn.addEventListener('click', function() {
            materialsContainer.classList.add('list-view');
            materialsContainer.classList.remove('grid-view');
            listViewBtn.classList.add('active');
            gridViewBtn.classList.remove('active');
            localStorage.setItem('preferredView', 'list');
        });

        // Set default view or load from localStorage
        const preferredView = localStorage.getItem('preferredView') || 'grid';
        if (preferredView === 'grid') {
            materialsContainer.classList.add('grid-view');
            gridViewBtn.classList.add('active');
        } else {
            materialsContainer.classList.add('list-view');
            listViewBtn.classList.add('active');
        }
    }
}

/**
 * Testimonial slider functionality
 */
function initializeTestimonialSlider() {
    const testimonials = document.querySelectorAll('.testimonial');
    const dots = document.querySelectorAll('.testimonial-dot');
    let currentIndex = 0;

    if (testimonials.length && dots.length) {
        function showTestimonial(index) {
            // Hide all testimonials
            testimonials.forEach(testimonial => {
                testimonial.style.display = 'none';
            });

            // Remove active class from all dots
            dots.forEach(dot => {
                dot.classList.remove('active');
            });

            // Show current testimonial and activate corresponding dot
            testimonials[index].style.display = 'block';
            dots[index].classList.add('active');
        }

        // Initialize with first testimonial
        showTestimonial(0);

        // Add click events to dots
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                currentIndex = index;
                showTestimonial(currentIndex);
            });
        });

        // Auto-slide functionality
        setInterval(() => {
            currentIndex = (currentIndex + 1) % testimonials.length;
            showTestimonial(currentIndex);
        }, 5000);
    }
}

/**
 * Initialize tooltips
 */
function initializeTooltips() {
    const tooltips = document.querySelectorAll('[data-tooltip]');
    
    tooltips.forEach(tooltip => {
        tooltip.addEventListener('mouseenter', function() {
            const tooltipText = this.getAttribute('data-tooltip');
            const tooltipEl = document.createElement('div');
            tooltipEl.classList.add('tooltip');
            tooltipEl.textContent = tooltipText;
            
            // Position the tooltip
            document.body.appendChild(tooltipEl);
            const rect = this.getBoundingClientRect();
            tooltipEl.style.top = rect.top - tooltipEl.offsetHeight - 10 + 'px';
            tooltipEl.style.left = rect.left + (rect.width / 2) - (tooltipEl.offsetWidth / 2) + 'px';
            
            // Add show class for animation
            setTimeout(() => {
                tooltipEl.classList.add('show');
            }, 10);
            
            this.addEventListener('mouseleave', function() {
                tooltipEl.classList.remove('show');
                setTimeout(() => {
                    document.body.removeChild(tooltipEl);
                }, 200);
            }, { once: true });
        });
    });
}

/**
 * Dropdown functionality
 */
function initializeDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown');
    
    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        const menu = dropdown.querySelector('.dropdown-menu');
        
        if (toggle && menu) {
            toggle.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                menu.classList.toggle('show');
            });
            
            // Close when clicking outside
            document.addEventListener('click', function(e) {
                if (!dropdown.contains(e.target)) {
                    menu.classList.remove('show');
                }
            });
        }
    });
}

/**
 * Form validation
 */
function initializeFormValidation() {
    const forms = document.querySelectorAll('.needs-validation');

    Array.from(forms).forEach(form => {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }

            form.classList.add('was-validated');
        }, false);

        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('input', function () {
                if (this.checkValidity()) {
                    this.classList.remove('is-invalid');
                    this.classList.add('is-valid');
                } else {
                    this.classList.remove('is-valid');
                    this.classList.add('is-invalid');
                }
            });
        });
    });
}


/**
 * Animations on scroll
 */
function initializeAnimations() {
    const animatedElements = document.querySelectorAll('.animate');
    
    function checkElements() {
        const triggerBottom = window.innerHeight * 0.8;
        
        animatedElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            
            if (elementTop < triggerBottom) {
                element.classList.add('animated');
            }
        });
    }
    
    // Initial check
    checkElements();
    
    // Check on scroll
    window.addEventListener('scroll', checkElements);
}

/**
 * Handle search functionality
 */
function handleSearch() {
    const searchInput = document.querySelector('#search-input');
    const searchForm = document.querySelector('#search-form');
    
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (searchInput && searchInput.value.trim() !== '') {
                // Redirect to search results page
                window.location.href = `/search?q=${encodeURIComponent(searchInput.value.trim())}`;
            }
        });
    }
}

/**
 * Ajax form submissions
 */
function initializeAjaxForms() {
    const ajaxForms = document.querySelectorAll('.ajax-form');
    
    ajaxForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const url = this.getAttribute('action');
            const method = this.getAttribute('method') || 'POST';
            const submitBtn = this.querySelector('[type="submit"]');
            
            // Disable submit button and show loading state
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            }
            
            // Send the AJAX request
            fetch(url, {
                method: method,
                body: formData,
                credentials: 'same-origin'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Show success message
                    showNotification('success', data.message || 'Operation completed successfully!');
                    
                    // Redirect if needed
                    if (data.redirect) {
                        setTimeout(() => {
                            window.location.href = data.redirect;
                        }, 1500);
                    }
                } else {
                    // Show error message
                    showNotification('error', data.message || 'An error occurred.');
                }
            })
            .catch(error => {
                showNotification('error', 'An unexpected error occurred.');
                console.error('Error:', error);
            })
            .finally(() => {
                // Re-enable submit button
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = submitBtn.getAttribute('data-original-text') || 'Submit';
                }
            });
        });
    });
}

/**
 * Show notification
 */
function showNotification(type, message) {
    const notification = document.createElement('div');
    notification.classList.add('notification', `notification-${type}`);
    
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        </div>
        <div class="notification-content">
            ${message}
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to the DOM
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Set auto-hide
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);
    
    // Handle close button
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    });
}

// Handle material voting and bookmarks
function initializeMaterialInteractions() {
    // Upvote/downvote buttons
    const voteButtons = document.querySelectorAll('.vote-btn');
    voteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const materialId = this.getAttribute('data-material-id');
            const voteType = this.getAttribute('data-vote-type');
            
            // Send AJAX request to vote endpoint
            fetch('/api/vote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ materialId, voteType }),
                credentials: 'same-origin'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Update UI
                    const countElement = document.querySelector(`.vote-count[data-material-id="${materialId}"]`);
                    if (countElement) {
                        countElement.textContent = data.votes;
                    }
                    
                    // Toggle active state
                    voteButtons.forEach(btn => {
                        if (btn.getAttribute('data-material-id') === materialId) {
                            btn.classList.remove('active');
                        }
                    });
                    this.classList.add('active');
                    
                    showNotification('success', data.message);
                } else {
                    showNotification('error', data.message || 'Failed to register your vote.');
                }
            })
            .catch(error => {
                showNotification('error', 'An error occurred while processing your vote.');
                console.error('Error:', error);
            });
        });
    });
    
    // Bookmark buttons
    const bookmarkButtons = document.querySelectorAll('.bookmark-btn');
    bookmarkButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const materialId = this.getAttribute('data-material-id');
            const isBookmarked = this.classList.contains('active');
            
            // Send AJAX request to bookmark endpoint
            fetch('/api/bookmark', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ materialId, action: isBookmarked ? 'remove' : 'add' }),
                credentials: 'same-origin'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Toggle active state
                    this.classList.toggle('active');
                    
                    // Update icon
                    const icon = this.querySelector('i');
                    if (icon) {
                        icon.className = isBookmarked ? 'far fa-bookmark' : 'fas fa-bookmark';
                    }
                    
                    showNotification('success', data.message);
                } else {
                    showNotification('error', data.message || 'Failed to update bookmark.');
                }
            })
            .catch(error => {
                showNotification('error', '



                    /**
 * Material filter functionality
 */
function initializeMaterialFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const filterDropdowns = document.querySelectorAll('.filter-dropdown');
    const materials = document.querySelectorAll('.material-card');
    
    // Handle filter button clicks
    if (filterBtns.length) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const filter = this.getAttribute('data-filter');
                
                // Toggle active class
                filterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // Filter materials
                materials.forEach(material => {
                    if (filter === 'all') {
                        material.style.display = 'block';
                    } else {
                        const categories = material.getAttribute('data-categories').split(',');
                        if (categories.includes(filter)) {
                            material.style.display = 'block';
                        } else {
                            material.style.display = 'none';
                        }
                    }
                });
                
                // Animate filtered items
                setTimeout(() => {
                    checkElements();
                }, 300);
            });
        });
    }
    
    // Handle filter dropdowns
    if (filterDropdowns.length) {
        filterDropdowns.forEach(dropdown => {
            const select = dropdown.querySelector('select');
            if (select) {
                select.addEventListener('change', function() {
                    const filterType = this.getAttribute('data-filter-type');
                    const filterValue = this.value;
                    
                    // Filter materials based on selected value
                    materials.forEach(material => {
                        const value = material.getAttribute(`data-${filterType}`);
                        
                        if (filterValue === 'all' || value === filterValue) {
                            material.classList.remove('filtered-out');
                        } else {
                            material.classList.add('filtered-out');
                        }
                    });
                });
            }
        });
    }
}

/**
 * Initialize rating system
 */
function initializeRatings() {
    const ratingContainers = document.querySelectorAll('.rating-container');
    
    ratingContainers.forEach(container => {
        const stars = container.querySelectorAll('.star');
        const ratingInput = container.querySelector('input[type="hidden"]');
        const materialId = container.getAttribute('data-material-id');
        
        // Show rating based on existing value
        if (ratingInput && ratingInput.value) {
            updateStars(ratingInput.value);
        }
        
        // Handle star hover
        stars.forEach((star, index) => {
            star.addEventListener('mouseenter', () => {
                updateStars(index + 1, true);
            });
            
            star.addEventListener('mouseleave', () => {
                if (ratingInput) {
                    updateStars(ratingInput.value || 0);
                } else {
                    updateStars(0);
                }
            });
            
            // Handle star click
            star.addEventListener('click', () => {
                const rating = index + 1;
                
                if (ratingInput) {
                    ratingInput.value = rating;
                }
                
                updateStars(rating);
                
                // Send rating to server via AJAX
                if (materialId) {
                    submitRating(materialId, rating);
                }
            });
        });
        
        function updateStars(count, isHover = false) {
            stars.forEach((star, i) => {
                if (i < count) {
                    star.classList.add('active');
                    if (isHover) {
                        star.classList.add('hover');
                    } else {
                        star.classList.remove('hover');
                    }
                } else {
                    star.classList.remove('active');
                    star.classList.remove('hover');
                }
            });
        }
        
        function submitRating(materialId, rating) {
            fetch('/api/rate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ materialId, rating }),
                credentials: 'same-origin'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Update average rating display if it exists
                    const avgRating = container.closest('.material-card').querySelector('.average-rating');
                    if (avgRating) {
                        avgRating.textContent = data.averageRating.toFixed(1);
                    }
                    showNotification('success', 'Rating submitted successfully!');
                } else {
                    showNotification('error', data.message || 'Failed to submit rating.');
                }
            })
            .catch(error => {
                showNotification('error', 'An error occurred while submitting your rating.');
                console.error('Error:', error);
            });
        }
    });
}

/**
 * Initialize comments section
 */
function initializeComments() {
    const commentForms = document.querySelectorAll('.comment-form');
    const replyButtons = document.querySelectorAll('.reply-btn');
    
    // Handle comment submission
    commentForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const materialId = this.getAttribute('data-material-id');
            const parentId = this.getAttribute('data-parent-id') || null;
            const commentText = formData.get('comment');
            
            if (!commentText.trim()) {
                showNotification('error', 'Please enter a comment.');
                return;
            }
            
            // Submit comment via AJAX
            fetch('/api/comment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    materialId,
                    parentId,
                    comment: commentText
                }),
                credentials: 'same-origin'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Add the new comment to the DOM
                    if (parentId) {
                        // Add reply to parent comment
                        const parentComment = document.querySelector(`.comment[data-comment-id="${parentId}"]`);
                        const repliesContainer = parentComment.querySelector('.comment-replies') || 
                                                createRepliesContainer(parentComment);
                        
                        repliesContainer.innerHTML += createCommentHTML(data.comment);
                    } else {
                        // Add top-level comment
                        const commentsContainer = document.querySelector('.comments-container');
                        if (commentsContainer) {
                            commentsContainer.innerHTML += createCommentHTML(data.comment);
                        }
                    }
                    
                    // Clear the form
                    form.reset();
                    
                    // Hide reply form if this was a reply
                    if (parentId) {
                        const replyForm = document.querySelector(`.reply-form[data-parent-id="${parentId}"]`);
                        if (replyForm) {
                            replyForm.style.display = 'none';
                        }
                    }
                    
                    showNotification('success', 'Comment posted successfully!');
                    
                    // Re-initialize reply buttons for the new comment
                    initializeComments();
                } else {
                    showNotification('error', data.message || 'Failed to post comment.');
                }
            })
            .catch(error => {
                showNotification('error', 'An error occurred while posting your comment.');
                console.error('Error:', error);
            });
        });
    });
    
    // Handle reply button clicks
    replyButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const commentId = this.getAttribute('data-comment-id');
            const replyForm = document.querySelector(`.reply-form[data-parent-id="${commentId}"]`);
            
            if (replyForm) {
                // Toggle reply form visibility
                if (replyForm.style.display === 'none' || !replyForm.style.display) {
                    // Hide all other reply forms first
                    document.querySelectorAll('.reply-form').forEach(form => {
                        form.style.display = 'none';
                    });
                    
                    replyForm.style.display = 'block';
                    replyForm.querySelector('textarea').focus();
                } else {
                    replyForm.style.display = 'none';
                }
            }
        });
    });
    
    function createRepliesContainer(parentComment) {
        const container = document.createElement('div');
        container.className = 'comment-replies';
        parentComment.appendChild(container);
        return container;
    }
    
    function createCommentHTML(comment) {
        return `
            <div class="comment" data-comment-id="${comment.id}">
                <div class="comment-avatar">
                    <img src="${comment.userAvatar || '/static/images/default-avatar.png'}" alt="User Avatar">
                </div>
                <div class="comment-content">
                    <div class="comment-header">
                        <span class="comment-author">${comment.username}</span>
                        <span class="comment-date">${comment.createdAt}</span>
                    </div>
                    <div class="comment-text">${comment.text}</div>
                    <div class="comment-actions">
                        <button class="reply-btn" data-comment-id="${comment.id}">Reply</button>
                    </div>
                    <div class="reply-form" data-parent-id="${comment.id}" style="display: none;">
                        <form class="comment-form" data-material-id="${comment.materialId}" data-parent-id="${comment.id}">
                            <textarea name="comment" placeholder="Write your reply..."></textarea>
                            <button type="submit" class="btn btn-primary">Post Reply</button>
                        </form>
                    </div>
                </div>
            </div>
        `;
    }
}

/**
 * Initialize material preview
 */
function initializeMaterialPreview() {
    const previewLinks = document.querySelectorAll('.preview-link');
    const previewModal = document.querySelector('#previewModal');
    const previewContent = document.querySelector('#previewContent');
    const previewClose = document.querySelector('#previewClose');
    
    if (previewLinks.length && previewModal && previewContent) {
        previewLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                const materialId = this.getAttribute('data-material-id');
                const materialUrl = this.getAttribute('href');
                const fileType = this.getAttribute('data-file-type');
                
                // Show loading state
                previewContent.innerHTML = '<div class="loader"></div>';
                previewModal.style.display = 'flex';
                
                // Fetch material preview
                fetch(`/api/preview/${materialId}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Display preview based on file type
                        if (fileType === 'pdf') {
                            previewContent.innerHTML = `
                                <iframe src="${materialUrl}" width="100%" height="100%" frameborder="0"></iframe>
                            `;
                        } else if (fileType === 'image') {
                            previewContent.innerHTML = `
                                <img src="${materialUrl}" alt="Preview" class="preview-image">
                            `;
                        } else {
                            previewContent.innerHTML = `
                                <div class="preview-error">
                                    <p>Preview not available for this file type.</p>
                                    <a href="${materialUrl}" class="btn btn-primary" download>Download Instead</a>
                                </div>
                            `;
                        }
                    } else {
                        previewContent.innerHTML = `
                            <div class="preview-error">
                                <p>${data.message || 'Failed to load preview.'}</p>
                                <a href="${materialUrl}" class="btn btn-primary" download>Download Instead</a>
                            </div>
                        `;
                    }
                })
                .catch(error => {
                    previewContent.innerHTML = `
                        <div class="preview-error">
                            <p>An error occurred while loading the preview.</p>
                            <a href="${materialUrl}" class="btn btn-primary" download>Download Instead</a>
                        </div>
                    `;
                    console.error('Error:', error);
                });
            });
        });
        
        // Close preview modal
        if (previewClose) {
            previewClose.addEventListener('click', function() {
                previewModal.style.display = 'none';
                previewContent.innerHTML = '';
            });
        }
        
        // Close when clicking outside the modal content
        previewModal.addEventListener('click', function(e) {
            if (e.target === previewModal) {
                previewModal.style.display = 'none';
                previewContent.innerHTML = '';
            }
        });
    }
}

/**
 * Initialize theme toggle
 */
function initializeThemeToggle() {
    const themeToggle = document.querySelector('.theme-toggle');
    
    if (themeToggle) {
        // Check for saved theme preference
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.body.classList.add(savedTheme);
        
        // Update toggle state
        if (savedTheme === 'dark') {
            themeToggle.classList.add('active');
        }
        
        // Handle toggle click
        themeToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            
            if (document.body.classList.contains('dark')) {
                document.body.classList.remove('dark');
                document.body.classList.add('light');
                localStorage.setItem('theme', 'light');
            } else {
                document.body.classList.remove('light');
                document.body.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            }
        });
    }
}

/**
 * Initialize material sharing
 */
function initializeSharing() {
    const shareButtons = document.querySelectorAll('.share-btn');
    
    if (shareButtons.length) {
        shareButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                const materialId = this.getAttribute('data-material-id');
                const materialTitle = this.getAttribute('data-title');
                const shareUrl = window.location.origin + '/material/' + materialId;
                
                // Create share modal
                const shareModal = document.createElement('div');
                shareModal.className = 'share-modal';
                shareModal.innerHTML = `
                    <div class="share-modal-content">
                        <h3>Share "${materialTitle}"</h3>
                        <div class="share-url-container">
                            <input type="text" value="${shareUrl}" readonly id="shareUrl">
                            <button class="copy-btn" data-clipboard-target="#shareUrl">
                                <i class="fas fa-copy"></i>
                            </button>
                        </div>
                        <div class="social-share-buttons">
                            <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}" target="_blank" class="social-share-btn facebook">
                                <i class="fab fa-facebook-f"></i>
                            </a>
                            <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent('Check out this study material: ' + materialTitle)}" target="_blank" class="social-share-btn twitter">
                                <i class="fab fa-twitter"></i>
                            </a>
                            <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}" target="_blank" class="social-share-btn linkedin">
                                <i class="fab fa-linkedin-in"></i>
                            </a>
                            <a href="mailto:?subject=${encodeURIComponent('Study Material: ' + materialTitle)}&body=${encodeURIComponent('Check out this study material: ' + shareUrl)}" class="social-share-btn email">
                                <i class="fas fa-envelope"></i>
                            </a>
                        </div>
                        <button class="close-modal-btn">Close</button>
                    </div>
                `;
                
                // Add to DOM
                document.body.appendChild(shareModal);
                
                // Show modal
                setTimeout(() => {
                    shareModal.classList.add('show');
                }, 10);
                
                // Handle copy button
                const copyBtn = shareModal.querySelector('.copy-btn');
                const shareUrlInput = shareModal.querySelector('#shareUrl');
                
                copyBtn.addEventListener('click', function() {
                    shareUrlInput.select();
                    document.execCommand('copy');
                    
                    // Show copied notification
                    this.innerHTML = '<i class="fas fa-check"></i>';
                    setTimeout(() => {
                        this.innerHTML = '<i class="fas fa-copy"></i>';
                    }, 2000);
                });
                
                // Handle close button
                const closeBtn = shareModal.querySelector('.close-modal-btn');
                closeBtn.addEventListener('click', function() {
                    shareModal.classList.remove('show');
                    setTimeout(() => {
                        document.body.removeChild(shareModal);
                    }, 300);
                });
                
                // Close when clicking outside
                shareModal.addEventListener('click', function(e) {
                    if (e.target === shareModal) {
                        shareModal.classList.remove('show');
                        setTimeout(() => {
                            document.body.removeChild(shareModal);
                        }, 300);
                    }
                });
            });
        });
    }
}

// Initialize all functionality
document.addEventListener('DOMContentLoaded', function() {
    // Already defined functions
    initializeNavbar();
    initializeFileUpload();
    initializeViewToggle();
    initializeTestimonialSlider();
    initializeTooltips();
    initializeDropdowns();
    initializeFormValidation();
    initializeAnimations();
    
    // New functions
    initializeMaterialFilters();
    initializeRatings();
    initializeComments();
    initializeMaterialPreview();
    initializeThemeToggle();
    initializeSharing();
    initializeMaterialInteractions();
    initializeAjaxForms();
    handleSearch();
});