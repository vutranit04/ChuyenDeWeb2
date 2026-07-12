package com.minhvu.spring_demo.service;

import com.minhvu.spring_demo.entity.CategoryPost;
import com.minhvu.spring_demo.entity.Post;
import com.minhvu.spring_demo.entity.User;
import com.minhvu.spring_demo.exception.ResourceNotFoundException;
import com.minhvu.spring_demo.repository.CategoryPostRepository;
import com.minhvu.spring_demo.repository.PostRepository;
import com.minhvu.spring_demo.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final CategoryPostRepository categoryPostRepository;
    private final UserRepository userRepository;

    public PostService(PostRepository postRepository,
                       CategoryPostRepository categoryPostRepository,
                       UserRepository userRepository) {
        this.postRepository = postRepository;
        this.categoryPostRepository = categoryPostRepository;
        this.userRepository = userRepository;
    }

    public Page<Post> getAllPosts(Long categoryPostId, Pageable pageable) {
        if (categoryPostId != null) {
            return postRepository.findByCategoryPostCategoryPostId(categoryPostId, pageable);
        }
        return postRepository.findAll(pageable);
    }

    public Post getPostById(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài viết với ID: " + id));
    }

    public Post createPost(Post post, String username) {
        User author = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tác giả"));
        post.setAuthor(author);

        if (post.getCategoryPost() != null && post.getCategoryPost().getCategoryPostId() != null) {
            CategoryPost cp = categoryPostRepository.findById(post.getCategoryPost().getCategoryPostId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục bài viết"));
            post.setCategoryPost(cp);
        }
        return postRepository.save(post);
    }

    public Post updatePost(Long id, Post postDetails) {
        Post post = getPostById(id);
        if (postDetails.getTitle() != null) post.setTitle(postDetails.getTitle());
        if (postDetails.getThumbnail() != null) post.setThumbnail(postDetails.getThumbnail());
        if (postDetails.getSummary() != null) post.setSummary(postDetails.getSummary());
        if (postDetails.getContent() != null) post.setContent(postDetails.getContent());
        if (postDetails.getStatus() != null) post.setStatus(postDetails.getStatus());
        if (postDetails.getCategoryPost() != null && postDetails.getCategoryPost().getCategoryPostId() != null) {
            CategoryPost cp = categoryPostRepository.findById(postDetails.getCategoryPost().getCategoryPostId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục bài viết"));
            post.setCategoryPost(cp);
        }
        return postRepository.save(post);
    }

    public void deletePost(Long id) {
        Post post = getPostById(id);
        post.setStatus(false);
        postRepository.save(post);
    }
}
