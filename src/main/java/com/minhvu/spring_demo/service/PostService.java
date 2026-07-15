package com.minhvu.spring_demo.service;

import com.minhvu.spring_demo.entity.CategoryPost;
import com.minhvu.spring_demo.entity.Post;
import com.minhvu.spring_demo.entity.User;
import com.minhvu.spring_demo.exception.ResourceNotFoundException;
import com.minhvu.spring_demo.repository.CategoryPostRepository;
import com.minhvu.spring_demo.repository.PostRepository;
import com.minhvu.spring_demo.repository.UserRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

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

    public List<Post> getAllPosts() {
        Sort sort = Sort.by("createdAt").descending();
        return postRepository.findAll(sort);
    }

    public Post getPostById(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài viết với ID: " + id));
    }

    public Post createPost(Post post, String username) {
        if (post.getPostId() != null) {
            if (post.getPostId() <= 0) {
                post.setPostId(null);
            } else if (postRepository.existsById(post.getPostId())) {
                throw new IllegalArgumentException("Mã bài viết (ID: " + post.getPostId() + ") đã tồn tại!");
            }
        }
        User author = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tác giả"));
        post.setAuthor(author);

        Long cpId = post.getCategoryPostId();
        if (cpId == null && post.getCategoryPost() != null) {
            cpId = post.getCategoryPost().getCategoryPostId();
        }
        if (cpId != null) {
            CategoryPost cp = categoryPostRepository.findById(cpId)
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

        Long cpId = postDetails.getCategoryPostId();
        if (cpId == null && postDetails.getCategoryPost() != null) {
            cpId = postDetails.getCategoryPost().getCategoryPostId();
        }
        if (cpId != null) {
            CategoryPost cp = categoryPostRepository.findById(cpId)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục bài viết"));
            post.setCategoryPost(cp);
        }
        return postRepository.save(post);
    }

    public void deletePost(Long id) {
        if (!postRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy bài viết với ID: " + id);
        }
        postRepository.deleteById(id);
    }
}
